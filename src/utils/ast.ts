import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export interface TargetElement {
  tagName: string;
  className?: string;
  innerText?: string;
}

export interface ElementUpdate {
  className?: string;
}

export const updateCode = (code: string, target: TargetElement, update: ElementUpdate): string => {
    try {
        const ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });

        // Handle inconsistent module exports in browser environments
        const traverseFn = (traverse as any).default || traverse;
        const generateFn = (generate as any).default || generate;

        let found = false;

        traverseFn(ast, {
            JSXElement(path: any) {
                if (found) return;

                const openingElement = path.node.openingElement;

                // Match Tag Name
                let tagName = '';
                if (t.isJSXIdentifier(openingElement.name)) {
                    tagName = openingElement.name.name;
                } else {
                   // Skip member expressions or namespaced names for simplicity
                   return;
                }

                if (tagName.toLowerCase() !== target.tagName.toLowerCase()) return;

                // Match Class Name
                const classNameAttr = openingElement.attributes.find(
                    (attr: any) => t.isJSXAttribute(attr) && attr.name.name === 'className'
                );

                let sourceClassName = '';
                if (classNameAttr && t.isStringLiteral(classNameAttr.value)) {
                    sourceClassName = classNameAttr.value.value;
                }

                // Normalize classes for comparison
                const normalize = (cls: string) => cls.split(/\s+/).filter(Boolean).sort().join(' ');

                const targetClass = normalize(target.className || '');
                const sourceClass = normalize(sourceClassName);

                if (targetClass !== sourceClass) {
                     return;
                }

                found = true;

                // Apply Updates
                if (update.className !== undefined) {
                    if (classNameAttr) {
                         classNameAttr.value = t.stringLiteral(update.className);
                    } else {
                        openingElement.attributes.push(
                            t.jsxAttribute(
                                t.jsxIdentifier('className'),
                                t.stringLiteral(update.className)
                            )
                        );
                    }
                }
            }
        });

        if (!found) {
            console.warn('Could not find matching element in AST');
            return code;
        }

        const output = generateFn(ast, {}, code);
        return output.code;

    } catch (error) {
        console.error('Error parsing/updating code:', error);
        return code;
    }
};
