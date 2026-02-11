import { useEffect, useState, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { useWebContainer } from './hooks/useWebContainer';
import { files } from './files';
import './App.css';

function App() {
  const { container } = useWebContainer();
  const [url, setUrl] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (!container || initialized.current) return;
    initialized.current = true;

    const start = async () => {
      // 1. Mount files
      await container.mount(files);

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
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <Group orientation="horizontal" style={{ flex: 1 }}>
        <Panel defaultSize={50} minSize={20}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={(files['src'] as any).directory['App.tsx'].file.contents}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        </Panel>
        <Separator style={{ width: '5px', background: '#444', cursor: 'col-resize' }} />
        <Panel defaultSize={50} minSize={20}>
           <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '5px', background: '#eee', borderBottom: '1px solid #ccc', color: '#333', flexShrink: 0 }}>
                Preview {url ? `(${url})` : ''}
            </div>
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
              {url ? (
                <iframe
                  src={url}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Preview"
                />
              ) : (
                <div className="loader-container">
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
