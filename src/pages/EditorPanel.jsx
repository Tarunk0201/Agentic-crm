import { Plus, Trash2, X } from 'lucide-react';

export default function EditorPanel({ node, onChange, onClose, onSetStart, isStart, onDelete }) {
  if (!node) return null;

  const update = (field, value) => {
    onChange({ ...node, [field]: value });
  };

  const updateBranch = (index, field, value) => {
    const newBranches = [...(node.branches || [])];
    newBranches[index] = { ...newBranches[index], [field]: value };
    onChange({ ...node, branches: newBranches });
  };

  const addBranch = () => {
    const branches = node.branches || [];
    const nextKey = String(branches.length + 1);
    onChange({ ...node, branches: [...branches, { key: nextKey, target: '' }] });
  };

  const removeBranch = (index) => {
    const newBranches = (node.branches || []).filter((_, i) => i !== index);
    onChange({ ...node, branches: newBranches });
  };

  return (
    <div className="sf-editor-panel">
      <div className="sf-editor-header">
        <h3>Edit Node</h3>
        <button className="sf-icon-btn" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="sf-editor-body">
        {/* Node ID / Name */}
        <div className="sf-field">
          <label>Node Name (ID)</label>
          <input
            value={node.id}
            onChange={e => update('id', e.target.value.replace(/\s+/g, '_').toLowerCase())}
            placeholder="node_greeting"
          />
        </div>

        {/* Type */}
        <div className="sf-field">
          <label>Type</label>
          <select value={node.type} onChange={e => update('type', e.target.value)}>
            <option value="menu">Menu (DTMF input)</option>
            <option value="action_forward">Action Forward</option>
            <option value="message">Message (TTS)</option>
            <option value="collect_input">Collect Input</option>
          </select>
        </div>

        {/* Text */}
        <div className="sf-field">
          <label>Text (TTS)</label>
          <textarea
            rows={3}
            value={node.text}
            onChange={e => update('text', e.target.value)}
            placeholder="Welcome! Press 1 for sales..."
          />
        </div>

        {/* Invalid Text */}
        <div className={`sf-field ${(node.branches || []).length === 0 ? 'disabled' : ''}`}>
          <label>Invalid Input Text</label>
          <input
            value={node.invalidText || ''}
            onChange={e => update('invalidText', e.target.value)}
            placeholder="Sorry, that's not valid."
            disabled={(node.branches || []).length === 0}
            title={(node.branches || []).length === 0 ? "Only available when branches are added" : ""}
          />
        </div>

        {/* End Call toggle */}
        <div className="sf-toggle-row">
          <label>End Call</label>
          <button
            className={`sf-toggle ${node.endCall ? 'on' : ''}`}
            onClick={() => {
              const newVal = !node.endCall;
              // If endCall is true, we must disable hasNext
              update('endCall', newVal);
              if (newVal) update('hasNext', false);
            }}
          />
        </div>

        {/* Has Next toggle */}
        <div className={`sf-toggle-row ${node.endCall ? 'disabled' : ''}`}>
          <label>Has "Next" output</label>
          <button
            className={`sf-toggle ${node.hasNext ? 'on' : ''}`}
            onClick={() => !node.endCall && update('hasNext', !node.hasNext)}
            disabled={node.endCall}
          />
        </div>

        {/* Set as Start */}
        <div className="sf-toggle-row">
          <label>Start Node</label>
          <button
            className={`sf-toggle ${isStart ? 'on' : ''}`}
            onClick={onSetStart}
          />
        </div>

        {/* Branches */}
        <div className="sf-field">
          <label>Branches (DTMF Options)</label>
          <div className="sf-branches">
            {(node.branches || []).map((b, i) => (
              <div key={b.key || i} className="sf-branch-item">
                <input
                  className="key"
                  value={b.key}
                  onChange={e => updateBranch(i, 'key', e.target.value)}
                  placeholder="#"
                />
                <input
                  className="val"
                  value={b.target || ''}
                  onChange={e => updateBranch(i, 'target', e.target.value)}
                  placeholder="target_node_name"
                />
                <button onClick={() => removeBranch(i)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button className="sf-add-branch-btn" onClick={addBranch}>
              <Plus size={14} /> Add Branch
            </button>
          </div>
        </div>

        {/* Delete Node */}
        <button
          className="sf-add-branch-btn"
          style={{ borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444', marginTop: 8 }}
          onClick={onDelete}
        >
          <Trash2 size={14} /> Delete Node
        </button>
      </div>
    </div>
  );
}
