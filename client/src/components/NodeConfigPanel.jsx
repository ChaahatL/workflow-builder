// components/NodeConfigPanel.jsx
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
                borderLeft: '1px solid #ddd'
            }}
        >
        <h4>{type} Config</h4>

        {/* Render fields based on node type */}
        {type !== 'LLMEngine' && type !== 'UserQuery' && (
            <p style={{ fontStyle: 'italic', color: '#777' }}>
                No configuration required for this node.
            </p>
        )}

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
            </>
        )}

        {type === 'UserQuery' && (
            <>
            <label>Sample Prompt:</label>
            <input
                type="text"
                name="prompt"
                value={config.prompt || ''}
                onChange={handleChange}
                style={{ width: 'fit-content', marginTop: '8px' }}
            />
            </>
        )}

        {/* Add more as needed */}
        {(type === 'LLMEngine' ||
        type === 'UserQuery') &&
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
        </button>}
        </div>
    );
};

export default NodeConfigPanel;