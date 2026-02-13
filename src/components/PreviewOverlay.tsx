import { useEffect, useState, type RefObject } from 'react';

interface ElementInfo {
  tagName: string;
  className?: string;
}

interface PreviewOverlayProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onElementSelect: (element: ElementInfo) => void;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function PreviewOverlay({ iframeRef, onElementSelect }: PreviewOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'element-selected') {
        setHighlightRect(event.data.rect);
        setSelectedElement({
          tagName: event.data.tagName,
          className: event.data.className
        });
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (selectedElement) {
      onElementSelect(selectedElement);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
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
              {selectedElement.tagName}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
