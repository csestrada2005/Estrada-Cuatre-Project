import { useEffect, useState, type RefObject } from 'react';

interface PreviewOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function PreviewOverlay({ iframeRef }: PreviewOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'element-selected') {
        setHighlightRect(event.data.rect);
        setSelectedElement(event.data.tagName);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!iframeRef.current?.contentWindow) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    iframeRef.current.contentWindow.postMessage({ type: 'get-element', x, y }, '*');
  };

  const handleMouseLeave = () => {
    setHighlightRect(null);
    setSelectedElement(null);
  };

  return (
    <div
      className="absolute inset-0 z-50"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      // Note: The requirement asked for pointer-events: none on the layout,
      // but also for an onMouseMove handler on this specific div.
      // Since pointer-events: none prevents mouse events on the element,
      // we must keep it interactive (pointer-events: auto) to capture mouse moves for the X-Ray logic.
    >
      {highlightRect && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none transition-all duration-75 ease-out"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
          }}
        >
          {selectedElement && (
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded shadow-sm font-mono whitespace-nowrap z-10">
              {selectedElement}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
