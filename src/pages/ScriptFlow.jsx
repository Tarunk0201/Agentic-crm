import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Save, Trash2, Play, ZoomIn, ZoomOut, RotateCcw,
  FileText, Power, Workflow,
} from 'lucide-react';
import NodeCard from './NodeCard';
import EditorPanel from './EditorPanel';
import { bezierPath, genNodeId, serializeToApi, deserializeFromApi, getPortPos } from './scriptFlowHelpers';
import './ScriptFlow.css';

const API = import.meta.env.VITE_API_BASE_URL || '';

export default function ScriptFlow() {
  const { tokens } = useAuth();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.accessToken}` };

  // --- Scripts list state ---
  const [scripts, setScripts] = useState([]);
  const [activeScriptId, setActiveScriptId] = useState(null);
  const [scriptName, setScriptName] = useState('');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Canvas state ---
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [startNodeId, setStartNodeId] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // --- Canvas transform ---
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // --- Dragging ---
  const [dragInfo, setDragInfo] = useState(null);
  const [panInfo, setPanInfo] = useState(null);
  const [connDrag, setConnDrag] = useState(null); // { fromNodeId, fromPort, mouseX, mouseY }

  const portElements = useRef({});
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  // ============ API CALLS ============

  const fetchScripts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/ivr-agent/scripts`, { headers });
      if (res.ok) setScripts(await res.json());
    } catch (e) { console.error('Fetch scripts error', e); }
  }, [tokens.accessToken]);

  useEffect(() => { fetchScripts(); }, [fetchScripts]);

  const loadScript = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/api/ivr-agent/scripts/${id}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setActiveScriptId(id);
      setScriptName(data.scriptName || '');
      const { nodes: n, connections: c, startNodeId: s } = deserializeFromApi(data.scriptBody);
      setNodes(n);
      setConnections(c);
      setStartNodeId(s);
      setSelectedNodeId(null);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
    } catch (e) { console.error('Load script error', e); }
  }, [tokens.accessToken]);

  const createScript = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${API}/api/ivr-agent/scripts`, {
        method: 'POST', headers,
        body: JSON.stringify({
          scriptName: newName.trim(),
          scriptBody: { start_node: 'node_start', nodes: { node_start: { type: 'menu', text: 'Welcome' } } },
        }),
      });
      if (res.ok) {
        setNewName('');
        await fetchScripts();
        const created = await res.json();
        if (created._id) loadScript(created._id);
      }
    } catch (e) { console.error('Create error', e); }
  }, [newName, tokens.accessToken]);

  const saveScript = useCallback(async () => {
    if (!activeScriptId) return;
    setSaving(true);
    try {
      const body = serializeToApi(nodes, connections, startNodeId);
      await fetch(`${API}/api/ivr-agent/scripts/${activeScriptId}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ scriptName, scriptBody: body }),
      });
      await fetchScripts();
    } catch (e) { console.error('Save error', e); }
    setSaving(false);
  }, [activeScriptId, nodes, connections, startNodeId, scriptName, tokens.accessToken]);

  const deleteScript = useCallback(async (id) => {
    try {
      await fetch(`${API}/api/ivr-agent/scripts/${id}`, { method: 'DELETE', headers });
      if (activeScriptId === id) {
        setActiveScriptId(null); setNodes([]); setConnections([]); setStartNodeId('');
      }
      await fetchScripts();
    } catch (e) { console.error('Delete error', e); }
  }, [activeScriptId, tokens.accessToken]);

  const toggleActive = useCallback(async (id) => {
    try {
      await fetch(`${API}/api/ivr-agent/scripts/${id}/toggle-active`, { method: 'PATCH', headers });
      await fetchScripts();
    } catch (e) { console.error('Toggle error', e); }
  }, [tokens.accessToken]);

  // ============ NODE OPERATIONS ============

  const addNode = useCallback(() => {
    const id = genNodeId('node');
    // Place near center of visible area
    const cx = (-offset.x + 400) / zoom;
    const cy = (-offset.y + 300) / zoom;
    setNodes(prev => [...prev, {
      id, x: cx, y: cy, type: 'menu', text: '', invalidText: '', endCall: false, branches: [], hasNext: true,
    }]);
    if (nodes.length === 0) setStartNodeId(id);
    setSelectedNodeId(id);
  }, [offset, zoom, nodes.length]);

  const updateNode = useCallback((updated) => {
    setNodes(prev => {
      const oldNode = prev.find(n => n.id === updated.id);
      // If id changed, update connections and startNodeId
      if (oldNode && oldNode.id !== updated.id) {
        // This is a rename - need to find the original by index
        const idx = prev.findIndex(n => n.id === selectedNodeId);
        if (idx === -1) return prev;
        const oldId = prev[idx].id;
        const newNodes = [...prev];
        newNodes[idx] = updated;

        // Update connections
        setConnections(cs => cs.map(c => ({
          ...c,
          fromNodeId: c.fromNodeId === oldId ? updated.id : c.fromNodeId,
          toNodeId: c.toNodeId === oldId ? updated.id : c.toNodeId,
        })));
        if (startNodeId === oldId) setStartNodeId(updated.id);
        setSelectedNodeId(updated.id);
        return newNodes;
      }
      return prev.map(n => n.id === updated.id ? updated : n);
    });
  }, [selectedNodeId, startNodeId]);

  const deleteNode = useCallback((id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.fromNodeId !== id && c.toNodeId !== id));
    if (startNodeId === id) setStartNodeId('');
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [startNodeId, selectedNodeId]);

  // ============ DRAG HANDLING ============

  const onNodeDragStart = useCallback((nodeId, e) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragInfo({ nodeId, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y });
  }, [nodes]);

  const onPortDragStart = useCallback((nodeId, portId, e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnDrag({
      fromNodeId: nodeId, fromPort: portId,
      mouseX: (e.clientX - rect.left - offset.x) / zoom,
      mouseY: (e.clientY - rect.top - offset.y) / zoom,
    });
  }, [offset, zoom]);

  const onPortDrop = useCallback((toNodeId) => {
    if (!connDrag || connDrag.fromNodeId === toNodeId) { setConnDrag(null); return; }
    
    // Create the connection
    const newConn = {
      fromNodeId: connDrag.fromNodeId, fromPort: connDrag.fromPort, toNodeId,
    };

    setConnections(prev => {
      // Remove existing connection from the same port if it exists
      const filtered = prev.filter(c => 
        !(c.fromNodeId === connDrag.fromNodeId && c.fromPort === connDrag.fromPort)
      );
      return [...filtered, newConn];
    });

    // Also update the node's internal target name for the branch if it's a branch port
    if (connDrag.fromPort.startsWith('branch_')) {
      const branchKey = connDrag.fromPort.replace('branch_', '');
      setNodes(prev => prev.map(n => {
        if (n.id === connDrag.fromNodeId) {
          const newBranches = n.branches.map(b => 
            b.key === branchKey ? { ...b, target: toNodeId } : b
          );
          return { ...n, branches: newBranches };
        }
        return n;
      }));
    } else if (connDrag.fromPort === 'next') {
      setNodes(prev => prev.map(n => n.id === connDrag.fromNodeId ? { ...n, hasNext: true } : n));
    }

    setConnDrag(null);
  }, [connDrag]);

  // Global mouse handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Node drag
      if (dragInfo) {
        const dx = (e.clientX - dragInfo.startX) / zoom;
        const dy = (e.clientY - dragInfo.startY) / zoom;
        setNodes(prev => prev.map(n =>
          n.id === dragInfo.nodeId ? { ...n, x: dragInfo.origX + dx, y: dragInfo.origY + dy } : n
        ));
      }
      // Canvas pan
      if (panInfo) {
        setOffset({
          x: panInfo.origX + (e.clientX - panInfo.startX),
          y: panInfo.origY + (e.clientY - panInfo.startY),
        });
      }
      // Connection drag
      if (connDrag) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          // Adjust for zoom and offset
          setConnDrag(prev => ({
            ...prev,
            mouseX: (e.clientX - rect.left - offset.x) / zoom,
            mouseY: (e.clientY - rect.top - offset.y) / zoom,
          }));
        }
      }
    };

    const handleMouseUp = () => {
      setDragInfo(null);
      setPanInfo(null);
      if (connDrag) setConnDrag(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragInfo, panInfo, connDrag, zoom, offset]);

  // Canvas pan on middle-click or background drag
  const handleCanvasBgDown = useCallback((e) => {
    // Only pan if clicking the background grid
    if (e.target !== e.currentTarget && !e.target.classList.contains('sf-canvas-wrap')) return;
    
    setSelectedNodeId(null);
    if (e.button === 0 || e.button === 1) {
      setPanInfo({ startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y });
    }
  }, [offset]);

  // Zoom and Pan with wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    if (e.ctrlKey) {
      // Zoom centered on mouse cursor
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Coordinate on canvas before zoom
      const canvasX = (mouseX - offset.x) / zoom;
      const canvasY = (mouseY - offset.y) / zoom;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, zoom * delta));

      // Calculate new offset to keep canvas point under mouse
      setOffset({
        x: mouseX - canvasX * newZoom,
        y: mouseY - canvasY * newZoom
      });
      setZoom(newZoom);
    } else if (e.shiftKey) {
      // Horizontal Pan
      setOffset(prev => ({ ...prev, x: prev.x - e.deltaY }));
    } else {
      // Vertical Pan
      setOffset(prev => ({
        x: prev.x - (e.deltaX || 0),
        y: prev.y - e.deltaY
      }));
    }
  }, [zoom, offset]);

  useEffect(() => {
    const el = canvasRef.current;
    if (el) el.addEventListener('wheel', handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener('wheel', handleWheel); };
  }, [handleWheel]);

  // Delete connection
  const deleteConnection = useCallback((fromNodeId, fromPort) => {
    setConnections(prev => prev.filter(c => !(c.fromNodeId === fromNodeId && c.fromPort === fromPort)));
    
    // Clear branch target in node data too
    if (fromPort.startsWith('branch_')) {
      const branchKey = fromPort.replace('branch_', '');
      setNodes(prev => prev.map(n => {
        if (n.id === fromNodeId) {
          return { ...n, branches: n.branches.map(b => b.key === branchKey ? { ...b, target: '' } : b) };
        }
        return n;
      }));
    }
  }, []);

  // ============ RENDER CONNECTIONS ============

  const renderConnections = () => {
    const paths = [];

    connections.forEach((conn, idx) => {
      const fromNode = nodes.find(n => n.id === conn.fromNodeId);
      const toNode = nodes.find(n => n.id === conn.toNodeId);
      if (!fromNode || !toNode) return;

      // Calculate exact port positions
      const fromPos = getPortPos(fromNode, conn.fromPort, portElements);
      const toPos = getPortPos(toNode, 'input', portElements);

      paths.push(
        <g key={`conn-${idx}`}>
          <path
            d={bezierPath(fromPos.x, fromPos.y, toPos.x, toPos.y)}
            className="sf-connection-line"
            onClick={(e) => {
              if (e.altKey || e.shiftKey) deleteConnection(conn.fromNodeId, conn.fromPort);
            }}
          />
          {/* Intersection circle for deletion on hover/click */}
          <circle 
            cx={(fromPos.x + toPos.x) / 2} 
            cy={(fromPos.y + toPos.y) / 2} 
            r="4" 
            fill="rgba(234,141,63,0.8)" 
            className="sf-conn-handle"
            onClick={() => deleteConnection(conn.fromNodeId, conn.fromPort)}
          />
        </g>
      );
    });

    // Temp connection while dragging
    if (connDrag) {
      const fromNode = nodes.find(n => n.id === connDrag.fromNodeId);
      if (fromNode) {
        const fromPos = getPortPos(fromNode, connDrag.fromPort, portElements);
        paths.push(
          <path
            key="temp"
            d={bezierPath(fromPos.x, fromPos.y, connDrag.mouseX, connDrag.mouseY)}
            className="sf-connection-temp"
          />
        );
      }
    }

    return paths;
  };

  // ============ SELECTED NODE ============
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // ============ RENDER ============
  return (
    <div className="sf-container">
      {/* Left panel - Scripts list */}
      <div className="sf-scripts-panel">
        <div className="sf-scripts-header">
          <h3>📋 Scripts</h3>
          <button className="sf-icon-btn" onClick={fetchScripts} title="Refresh">
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="sf-scripts-list">
          {scripts.length === 0 && (
            <div className="sf-empty" style={{ padding: 24 }}>
              <FileText size={28} />
              <span>No scripts yet</span>
            </div>
          )}
          {scripts.map(s => (
            <div
              key={s._id}
              className={`sf-script-item ${activeScriptId === s._id ? 'active' : ''}`}
              onClick={() => loadScript(s._id)}
            >
              {s.isActive && <span className="sf-active-badge">Live</span>}
              <span className="name">{s.scriptName}</span>
              <div className="actions">
                <button
                  className="sf-icon-btn"
                  title={s.isActive ? 'Deactivate' : 'Activate'}
                  onClick={e => { e.stopPropagation(); toggleActive(s._id); }}
                >
                  <Power size={12} />
                </button>
                <button
                  className="sf-icon-btn danger"
                  title="Delete"
                  onClick={e => { e.stopPropagation(); deleteScript(s._id); }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sf-new-script">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New script name..."
            onKeyDown={e => e.key === 'Enter' && createScript()}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="sf-canvas-wrap" ref={canvasRef} onMouseDown={handleCanvasBgDown}>
        {/* Toolbar */}
        <div className="sf-toolbar">
          {activeScriptId && (
            <input
              value={scriptName}
              onChange={e => setScriptName(e.target.value)}
              className="sf-toolbar-input"
              style={{
                background: '#f1f1f1', 
                border: '1px solid #d4d4d8',
                borderRadius: 8, 
                padding: '6px 12px', 
                color: '#18181b', 
                fontSize: 13,
                fontWeight: 600, 
                outline: 'none', 
                width: 180,
              }}
            />
          )}
          <button className="primary" onClick={addNode}>
            <Plus size={14} /> Add Node
          </button>
          {activeScriptId && (
            <button className="primary" onClick={saveScript} disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="sf-zoom-controls">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.15))}><ZoomIn size={16} /></button>
          <div className="sf-zoom-label">{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.15))}><ZoomOut size={16} /></button>
          <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Canvas layer */}
        <div
          className="sf-canvas"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        >
          {/* SVG connections */}
          <svg className="sf-canvas-svg" ref={svgRef}>
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <NodeCard
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isStart={startNodeId === node.id}
              onSelect={setSelectedNodeId}
              onDragStart={onNodeDragStart}
              onPortDragStart={onPortDragStart}
              onPortDrop={onPortDrop}
              portElements={portElements}
              draggingConn={!!connDrag}
            />
          ))}
        </div>

        {/* Empty state */}
        {!activeScriptId && nodes.length === 0 && (
          <div className="sf-empty">
            <Workflow size={48} />
            <span>Select or create a script to start building</span>
          </div>
        )}
      </div>

      {/* Right editor panel */}
      {selectedNode && (
        <EditorPanel
          node={selectedNode}
          onChange={updateNode}
          onClose={() => setSelectedNodeId(null)}
          onSetStart={() => setStartNodeId(selectedNode.id)}
          isStart={startNodeId === selectedNode.id}
          onDelete={() => deleteNode(selectedNode.id)}
        />
      )}
    </div>
  );
}
