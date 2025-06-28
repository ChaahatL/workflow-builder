// components/FlowRenderer.jsx
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
} from 'react-flow-renderer';
import NodeConfigPanel from './NodeConfigPanel';
import FlowCanvasButtons from './FlowCanvasButtons';

const FlowRenderer = ({
  nodes,
  edges,
  nodeTypes,
  selectedNode,
  reactFlowWrapper,
  editBoxRef,
  configPanelRef,
  onDrop,
  onDragOver,
  onInit,
  onConnect,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onPaneClick,
  onLabelChange,
  onDeleteNode,
  onUpdateNode,
  onSave,
  onExport,
  onDownload,
  onSimulate,
}) => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Center: ReactFlow Canvas */}
      <div
        ref={reactFlowWrapper}
        style={{ flex: 1, position: 'relative' }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={onInit}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* Floating Label Edit Box */}
        {selectedNode && (
          <div
            ref={editBoxRef}
            style={{
              position: 'absolute',
              top: 60,
              right: 10,
              padding: '12px',
              background: '#f9f9f9',
              border: '1px solid #ccc',
              borderRadius: '8px',
              zIndex: 20,
              width: '175px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Edit Node</strong>
              <button
                onClick={onDeleteNode}
                style={{
                  marginTop: '4px',
                  padding: '6px 6px',
                  border: '1px solid red',
                  background: 'white',
                  color: 'red',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Delete
              </button>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '14px' }}>Label:</label>
              <input
                value={selectedNode?.data?.label || ''}
                onChange={onLabelChange}
                style={{ width: 'fit-content', marginTop: '4px', padding: '4px' }}
              />
            </div>
          </div>
        )}

        {/* Button Panel */}
        <FlowCanvasButtons
          onExport={onExport}
          onDownload={onDownload}
          onSimulate={onSimulate}
          onSave={onSave}
        />
      </div>

      {/* Right: Config Sidebar */}
      <NodeConfigPanel
        selectedNode={selectedNode}
        onUpdateNode={onUpdateNode}
        onClose={() => onPaneClick()}
        configPanelRef={configPanelRef}
      />
    </div>
  );
};

export default FlowRenderer;