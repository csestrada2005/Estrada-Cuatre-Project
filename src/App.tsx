import { useEffect, useState, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { webContainerService } from './services/WebContainerService';
import { updateCode } from './utils/ast';
import { files } from './files';
import './App.css';

function App() {
  const [booted, setBooted] = useState(false);
  const [url, setUrl] = useState('');
  // Assuming files structure is known and fixed for this demo
  const [code, setCode] = useState((files as any).src.directory['App.tsx'].file.contents);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'element-selected') {
        setSelectedElement(event.data.payload);
        console.log('Selected Element:', event.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleClassChange = (newClass: string) => {
    if (!selectedElement) return;

    // Update AST
    const newCode = updateCode(code, {
        tagName: selectedElement.tagName,
        className: selectedElement.className,
        innerText: selectedElement.textContent,
    }, {
        className: newClass
    });

    setCode(newCode);

    // Update local selected element state immediately for UI responsiveness
    // We update the class name so subsequent edits find the right element
    setSelectedElement({ ...selectedElement, className: newClass });

    // Write to WebContainer
    webContainerService.writeFile('/src/App.tsx', newCode);
  };

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

      webContainerService.onServerReady((_port, url) => {
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
      <Group orientation="horizontal" style={{ flex: 1 }}>
        <Panel defaultSize={50} minSize={20}>
          <Editor
            height="100%"
            value={code}
            onChange={(value) => setCode(value || '')}
            defaultLanguage="typescript"
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
            {selectedElement && (
                <div style={{ padding: '10px', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                    <div style={{ marginBottom: '5px' }}>
                        <strong>{selectedElement.tagName}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                         <label style={{ fontSize: '0.9em' }}>Class:</label>
                         <input
                            type="text"
                            value={selectedElement.className || ''}
                            onChange={(e) => handleClassChange(e.target.value)}
                            style={{ flex: 1, padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                         />
                    </div>
                </div>
            )}
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
              <iframe
                  ref={iframeRef}
                  src={url || 'about:blank'}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Preview"
              />
              {/* Transparent Overlay for capturing clicks */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
                }}
                onClick={(e) => {
                  if (!iframeRef.current) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;

                  // Send message to iframe to get element at (x, y)
                  iframeRef.current.contentWindow?.postMessage({
                    type: 'get-element',
                    x,
                    y
                  }, '*');
                }}
              >
                {selectedElement && selectedElement.rect && (
                  <div
                    style={{
                      position: 'absolute',
                      top: selectedElement.rect.top,
                      left: selectedElement.rect.left,
                      width: selectedElement.rect.width,
                      height: selectedElement.rect.height,
                      border: '2px solid #007bff',
                      backgroundColor: 'rgba(0, 123, 255, 0.2)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            </div>
           </div>
        </Panel>
      </Group>
    </div>
  );
}

export default App;
