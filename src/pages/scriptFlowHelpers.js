// Bezier curve path between two points
export function bezierPath(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

// Generate unique node id
let _counter = 0;
export function genNodeId(name = 'node') {
  _counter++;
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}_${_counter}`;
}

// Convert canvas nodes+connections → API scriptBody
export function serializeToApi(nodes, connections, startNodeId) {
  const apiNodes = {};
  nodes.forEach(n => {
    const obj = { type: n.type, text: n.text };
    if (n.invalidText) obj.invalid_text = n.invalidText;
    if (n.endCall) obj.end_call = true;

    // Build branches from connections
    if (n.branches && n.branches.length > 0) {
      const branches = {};
      n.branches.forEach(b => {
        // Find connection from this node's branch port
        const conn = connections.find(c => c.fromNodeId === n.id && c.fromPort === `branch_${b.key}`);
        branches[b.key] = conn ? conn.toNodeId : b.target || '';
      });
      obj.branches = branches;
    }

    // Next connection
    const nextConn = connections.find(c => c.fromNodeId === n.id && c.fromPort === 'next');
    if (nextConn) obj.next = nextConn.toNodeId;

    apiNodes[n.id] = obj;
  });

  return {
    start_node: startNodeId || (nodes[0] ? nodes[0].id : ''),
    nodes: apiNodes,
  };
}

// Convert API scriptBody → canvas nodes+connections with auto layout
export function deserializeFromApi(scriptBody) {
  if (!scriptBody || !scriptBody.nodes) return { nodes: [], connections: [], startNodeId: '' };

  const entries = Object.entries(scriptBody.nodes);
  const nodes = [];
  const connections = [];
  
  // Build adjacency for layout
  const children = {};
  entries.forEach(([id, data]) => {
    const targets = [];
    if (data.branches) {
      Object.entries(data.branches).forEach(([k, targetId]) => {
        if (targetId) targets.push(targetId);
      });
    }
    if (data.next) targets.push(data.next);
    children[id] = targets;
  });

  // BFS layout from start_node
  const startId = scriptBody.start_node || (entries[0] ? entries[0][0] : '');
  const visited = new Set();
  const positions = {};
  const queue = [[startId, 0, 0]];
  const levelCounts = {};

  while (queue.length > 0) {
    const [nodeId, level, index] = queue.shift();
    if (visited.has(nodeId) || !scriptBody.nodes[nodeId]) continue;
    visited.add(nodeId);

    if (!levelCounts[level]) levelCounts[level] = 0;
    const yIndex = levelCounts[level];
    levelCounts[level]++;

    positions[nodeId] = { x: 80 + level * 340, y: 80 + yIndex * 220 };

    (children[nodeId] || []).forEach((cid, i) => {
      if (!visited.has(cid)) queue.push([cid, level + 1, i]);
    });
  }

  // Place any unvisited nodes
  entries.forEach(([id]) => {
    if (!positions[id]) {
      const maxY = Math.max(0, ...Object.values(positions).map(p => p.y));
      positions[id] = { x: 80, y: maxY + 220 };
    }
  });

  // Build nodes
  entries.forEach(([id, data]) => {
    const branches = data.branches
      ? Object.entries(data.branches).map(([k, v]) => ({ key: k, target: v }))
      : [];

    nodes.push({
      id,
      x: positions[id].x,
      y: positions[id].y,
      type: data.type || 'menu',
      text: data.text || '',
      invalidText: data.invalid_text || '',
      endCall: !!data.end_call,
      branches,
      hasNext: !!data.next,
    });

    // Create connections from branches
    if (data.branches) {
      Object.entries(data.branches).forEach(([k, targetId]) => {
        if (targetId && scriptBody.nodes[targetId]) {
          connections.push({ fromNodeId: id, fromPort: `branch_${k}`, toNodeId: targetId });
        }
      });
    }
    if (data.next && scriptBody.nodes[data.next]) {
      connections.push({ fromNodeId: id, fromPort: 'next', toNodeId: data.next });
    }
  });

  return { nodes, connections, startNodeId: startId };
}

// Get port position on a node for connection rendering
export function getPortPos(node, portId, portElements) {
  // If we have DOM references, use them for perfect precision
  const key = `${node.id}_${portId}`;
  const el = portElements.current?.[key];
  if (el) {
    const rect = el.getBoundingClientRect();
    const canvas = el.closest('.sf-canvas');
    if (canvas) {
      const cRect = canvas.getBoundingClientRect();
      const style = window.getComputedStyle(canvas);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const scale = matrix.a; // zoom level
      
      return {
        x: (rect.left + rect.width / 2 - cRect.left) / scale,
        y: (rect.top + rect.height / 2 - cRect.top) / scale,
      };
    }
  }

  // Fallback: calculation based on node geometry
  const headerH = 42;
  const bodyH = node.text ? 40 : 0; // estimate
  const portRowH = 31; // matches CSS row height + border

  if (portId === 'input') {
    return { x: node.x, y: node.y + 20 };
  }

  // Calculate Y based on port index
  let portIdx = 0;
  if (portId === 'next') {
    portIdx = node.branches ? node.branches.length : 0;
  } else {
    const bKey = portId.replace('branch_', '');
    const bIdx = (node.branches || []).findIndex(b => b.key === bKey);
    portIdx = bIdx >= 0 ? bIdx : 0;
  }

  return {
    x: node.x + 260, // node width
    y: node.y + headerH + bodyH + (portIdx * portRowH) + (portRowH / 2)
  };
}
