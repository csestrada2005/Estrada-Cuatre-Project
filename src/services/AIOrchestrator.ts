import type { FileSystemTree, DirectoryNode, FileNode } from '@webcontainer/api';

export class AIOrchestrator {
  static async parseUserCommand(input: string, currentFileTree: FileSystemTree): Promise<FileSystemTree | null> {
    if (input.toLowerCase().includes('button')) {
      const newContent = `
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button style={{ backgroundColor: 'purple', color: 'white', marginLeft: '10px' }}>
          AI Generated
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
      `.trim();

      // Deep clone the tree
      const newTree = JSON.parse(JSON.stringify(currentFileTree));

      // Navigate to src/App.tsx
      // We assume the structure is valid for this mock
      const srcNode = newTree['src'];
      if (srcNode && 'directory' in srcNode) {
        const appNode = srcNode.directory['App.tsx'];
        if (appNode && 'file' in appNode) {
          appNode.file.contents = newContent;
          return newTree;
        }
      }
    }
    return null;
  }
}
