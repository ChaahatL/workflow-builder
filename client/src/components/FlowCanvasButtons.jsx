// components/FlowCanvasButtons.jsx
const FlowCanvasButtons = ({ onSimulate, onExport, onDownload, onSave }) => {
  const commonStyle = {
    position: 'absolute',
    zIndex: 20,
    padding: '8px 12px',
    color: 'black',
    border: '1px solid #888',
    borderRadius: '4px',
    cursor: 'pointer',
    background: 'white',
  };

  return (
    <>
      <button onClick={onSimulate} style={{ ...commonStyle, top: 10, right: 260 }}>
        Simulate Workflow
      </button>

      <button onClick={onExport} style={{ ...commonStyle, top: 10, right: 120 }}>
        Export to Console
      </button>

      <button
        onClick={onDownload}
        style={{ ...commonStyle, top: 10, right: 8 }}
      >
        Export to File
      </button>

      <button
        onClick={onSave}
        style={{ ...commonStyle, top: 10, right: 405 }}
      >
        Save Workflow
      </button>
    </>
  );
};

export default FlowCanvasButtons;