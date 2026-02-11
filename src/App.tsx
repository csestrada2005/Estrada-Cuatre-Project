import { useEffect, useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { webContainerService } from './services/WebContainerService';
import './App.css';

function App() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    webContainerService.boot().then(() => {
      setBooted(true);
      console.log('WebContainer initialized');
    });
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
            <div style={{ padding: '5px', background: '#eee', borderBottom: '1px solid #ccc', color: '#333', flexShrink: 0 }}>Preview</div>
            <iframe
                src="about:blank"
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
