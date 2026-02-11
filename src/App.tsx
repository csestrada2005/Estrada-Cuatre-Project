import { useEffect, useState, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { webContainerService } from './services/WebContainerService';
import { files } from './files';
import './App.css';

function App() {
  const [booted, setBooted] = useState(false);
  const [url, setUrl] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const start = async () => {
      await webContainerService.boot();
      setBooted(true);
      console.log('WebContainer initialized');

      await webContainerService.mount(files);
      console.log('Files mounted');

      const exitCode = await webContainerService.installDependencies((data) => {
         console.log(data);
      });
      console.log('Dependencies installed, exit code:', exitCode);

      if (exitCode !== 0) {
          console.error('Installation failed');
          return;
      }

      await webContainerService.startDevServer((data) => {
          console.log(data);
      });
      console.log('Dev server started');

      webContainerService.onServerReady((port, url) => {
        console.log('Server ready:', url);
        setUrl(url);
      });
    };

    start();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
       <div style={{ padding: '10px', background: '#333', color: '#fff', borderBottom: '1px solid #555', flexShrink: 0 }}>
          <strong>Open-Lovable Builder</strong> {booted ? '(WebContainer Booted)' : '(Booting...)'}
       </div>
      <Group direction="horizontal" style={{ flex: 1 }}>
        <Panel defaultSize={50} minSize={20}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// WebContainer is ready"
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
            <iframe
                src={url || 'about:blank'}
                style={{ flex: 1, width: '100%', border: 'none' }}
                title="Preview"
            />
           </div>
        </Panel>
      </Group>
    </div>
  );
}

export default App;
