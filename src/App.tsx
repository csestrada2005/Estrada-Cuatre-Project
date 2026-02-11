import { useEffect, useState, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { useWebContainer } from './hooks/useWebContainer';
import './App.css';

const files = {
  'index.js': {
    file: {
      contents: `
const express = require('express');
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});
      `.trim(),
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "example-app",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon index.js"
  }
}
      `.trim(),
    },
  },
};

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

      // 3. npm start
      const startProcess = await container.spawn('npm', ['start']);
      startProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log('[start]', data);
        }
      }));

      // 4. Listen for server-ready
      container.on('server-ready', (_port, url) => {
        console.log('Server ready:', url);
        setUrl(url);
      });
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
            defaultValue={files['index.js'].file.contents}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                  Loading...
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
