import React, { useState, useEffect } from 'react';

const NodeConfigPanel = ({ selectedNode, onUpdateNode, configPanelRef, onClose }) => {
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdateNode(selectedNode.id, config);
    console.log(`Config saved for ${selectedNode.id}:`, config);
    onClose();
  };

  const type = selectedNode.data.type;

  return (
    <div
      ref={configPanelRef}
      style={{
        width: '180px',
        padding: '10px',
        borderLeft: '1px solid #ddd',
      }}
    >
      <h4>{type} Config</h4>

      {/* 🛑 No config for UserQuery node */}
      {type === 'UserQuery' && (
        <p style={{ fontStyle: 'italic', color: '#777' }}>
          This node uses chat input at runtime. No configuration needed.
        </p>
      )}

      {/* ✅ LLMEngine config */}
      {type === 'LLMEngine' && (
        <>
          <label>Temperature:</label>
          <input
            type="number"
            name="temperature"
            value={config.temperature || ''}
            onChange={handleChange}
            style={{ width: 'fit-content', marginTop: '8px' }}
          />
          <button
            onClick={handleSave}
            style={{
              marginTop: '10px',
              padding: '6px 12px',
              border: '1px solid black',
              background: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save Config
          </button>
        </>
      )}

      {type === 'DocumentInput' && (
        <>
          <label>Upload PDF:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result.split(',')[1]; // remove data:... prefix
                  setConfig({ ...config, fileName: file.name, content: base64 });
                };
                reader.readAsDataURL(file);
              }
            }}
            style={{ marginTop: '8px' }}
          />
          {config.fileName && (
            <p style={{ fontSize: '0.8rem', color: '#333' }}>📄 {config.fileName}</p>
          )}
          <button
            onClick={handleSave}
            style={{
              marginTop: '10px',
              padding: '6px 12px',
              border: '1px solid black',
              background: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save Document
          </button>
        </>
      )}

      {/* For nodes that require no config */}
      {type !== 'LLMEngine' && type !== 'UserQuery' && (
        <p style={{ fontStyle: 'italic', color: '#777' }}>
          No configuration required for this node.
        </p>
      )}
    </div>
  );
};

export default NodeConfigPanel;