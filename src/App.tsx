import { useEffect, useState, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { useWebContainer } from './hooks/useWebContainer';
import { files } from './files';
import './App.css';
import { ChatInterface } from './components/ChatInterface';
import type { FileSystemTree } from '@webcontainer/api';
import { webContainerService } from './services/WebContainerService';

function App() {
  const { container } = useWebContainer();
  const [url, setUrl] = useState('');
  const [fileTree, setFileTree] = useState<FileSystemTree>(files);
  const initialized = useRef(false);

  const handleCodeUpdate = async (newTree: FileSystemTree) => {
    setFileTree(newTree);
    if (container) {
      await webContainerService.mount(newTree);
    }
  };

  const getAppContent = () => {
    const src = fileTree['src'];
    if (src && 'directory' in src) {
      const app = src.directory['App.tsx'];
      if (app && 'file' in app) {
        if ('contents' in app.file) {
          return typeof app.file.contents === 'string'
            ? app.file.contents
            : new TextDecoder().decode(app.file.contents);
        }
      }
    }
    return '';
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;

    setFileTree(prev => {
      const newTree = { ...prev };
      const srcNode = newTree['src'];

      if (srcNode && 'directory' in srcNode) {
        newTree['src'] = {
            directory: {
                ...srcNode.directory,
                'App.tsx': {
                    file: {
                        contents: value
                    }
                }
            }
        };
      }
      return newTree;
    });
  };

  useEffect(() => {
    if (!container || initialized.current) return;
    initialized.current = true;

    const start = async () => {
      // 1. Mount files
      await container.mount(fileTree);

      // 2. npm install
      const installProcess = await container.spawn('npm', ['install']);
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[install]', data);
        }
      }));

      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        console.error('Installation failed');
        return;
      }

      // 3. Listen for server-ready
      container.on('server-ready', (_port, url) => {
        console.log('Server ready:', url);
        setUrl(url);
      });

      // 4. npm run dev
      const startProcess = await container.spawn('npm', ['run', 'dev']);
      startProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[run dev]', data);
        }
      }));
    };

    start();
  }, [container]);

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden">
      <Group orientation="horizontal" className="flex-1">
        <Panel defaultSize={20} minSize={10}>
          <ChatInterface onCodeUpdate={handleCodeUpdate} />
        </Panel>
        <Separator className="w-1 bg-gray-800 hover:bg-blue-500 transition-colors cursor-col-resize" />
        <Panel defaultSize={40} minSize={20}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={getAppContent()}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        </Panel>
        <Separator className="w-1 bg-gray-800 hover:bg-blue-500 transition-colors cursor-col-resize" />
        <Panel defaultSize={40} minSize={20}>
          <div className="h-full w-full bg-white flex flex-col">
            <div className="h-10 px-4 bg-gray-100 border-b border-gray-300 flex items-center text-gray-700 text-sm flex-shrink-0">
              <span className="truncate">Preview {url ? `(${url})` : ''}</span>
            </div>
            <div className="flex-1 relative w-full">
              {url ? (
                <iframe
                  src={url}
                  className="w-full h-full border-none"
                  title="Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                  <div className="spinner"></div>
                  <div>Loading...</div>
                </div>
              )}
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  );
}

export default App;
