import { useRef, useCallback } from 'react';
import { Grip, X } from 'lucide-react';

export default function NodeCard({
  node, isSelected, isStart, onSelect, onDragStart,
  onPortDragStart, onPortDrop, portElements, draggingConn,
}) {
  const headerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(node.id);
    onDragStart(node.id, e);
  }, [node.id, onSelect, onDragStart]);

  const registerPort = useCallback((el, portId) => {
    if (portElements.current) {
      portElements.current[`${node.id}_${portId}`] = el;
    }
  }, [node.id, portElements]);

  const outputPorts = [];
  if (node.branches) {
    node.branches.forEach(b => {
      outputPorts.push({ id: `branch_${b.key}`, label: `${b.key}: ${b.target || '...'}` });
    });
  }
  if (node.hasNext || (!node.endCall && outputPorts.length === 0)) {
    outputPorts.push({ id: 'next', label: 'Next →' });
  }

  return (
    <div
      className={`sf-node ${isSelected ? 'selected' : ''} ${isStart ? 'start-node' : ''}`}
      style={{ left: node.x, top: node.y }}
      onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
    >
      {/* Input port */}
      <div
        className={`sf-node-input-port ${draggingConn ? 'highlight' : ''}`}
        ref={el => registerPort(el, 'input')}
        onMouseUp={(e) => { e.stopPropagation(); onPortDrop(node.id); }}
      />

      {/* Header */}
      <div className="sf-node-header" ref={headerRef} onMouseDown={handleMouseDown}>
        <div className="left">
          <span className={`sf-node-type-dot ${node.type}`} />
          <span className="sf-node-title">{node.id}</span>
        </div>
        {isStart && <span className="sf-start-badge">START</span>}
        {node.endCall && <span className="sf-end-badge">END</span>}
      </div>

      {/* Body preview */}
      {node.text && (
        <div className="sf-node-body">{node.text}</div>
      )}

      {/* Output ports */}
      <div className="sf-node-ports">
        {outputPorts.map(port => (
          <div key={port.id} className="sf-port-row">
            <span className="label">{port.label}</span>
            <div
              className="sf-port-out"
              ref={el => registerPort(el, port.id)}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onPortDragStart(node.id, port.id, e);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
