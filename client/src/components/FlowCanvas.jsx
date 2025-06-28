import { useRef, useState, useEffect } from 'react';
import { NodeTypes } from './nodes/CustomNodes';
import NodeConfigPanel from './NodeConfigPanel';
import {toast} from 'react-toastify'
import { savedWorkflow, loadWorkflow } from '../api/workFlowAPI';
import useWorkflowState from "../hooks/useWorkflowState"
import { transformWorkflow, convertToReactFlow, downloadJSON, simulateWorkflow } from '../utils/workflowTransform';
import FlowCanvasButtons from "../components/FlowCanvasButtons";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from 'react-flow-renderer';

const InnerFlowCanvas = () => {
  const [nodes, setNodes] = useState([
    {
      id: "node_0",  // instead of hardcoding 'node_0'
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Initial Node', type: 'Initial' },
    },
  ]);

  const editBoxRef = useRef(null);
  const configPanelRef = useRef(null);

  const [edges, setEdges] = useState([]);

  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null); // store the instance safely

  const {
    onInit,
    onConnect,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    onDrop,
    onDragOver,
    selectedNode,
    setSelectedNode,
  } = useWorkflowState(setNodes, setEdges, reactFlowWrapper, reactFlowInstance);


  const handlePaneClick = () => {
    setSelectedNode(null);
  };

  const handleSave = async () => {

    // inside a button handler
    const structured = transformWorkflow(nodes, edges);
    const response = await savedWorkflow(structured);
    console.log(response);
  }

  const onUpdateNode = (id, newConfig) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, config: newConfig } }
          : node
      )
    );
    toast.success("Config saved");
  };

  const deleteSelectedNode = () => {
    if(!selectedNode) return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);

  }

  const handleSimulate = () => simulateWorkflow(nodes, edges);

  const handleExport = () => {
    const structured = transformWorkflow(nodes, edges);
    console.log(structured);
  };

  const handleDownload = () => {
    const structured = transformWorkflow(nodes, edges);
    downloadJSON(structured);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideFlow =
        reactFlowWrapper.current && !reactFlowWrapper.current.contains(event.target);
      const clickedOutsideConfig = 
        configPanelRef.current && !configPanelRef.current.contains(event.target);
      if (clickedOutsideConfig && clickedOutsideFlow) {
        setSelectedNode(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSelectedNode]);

  useEffect(() => {
    const loadInitialWorkflow = async () => {
      try {
        const saved = await loadWorkflow();
        if (!saved || saved.length === 0) return;

        const { nodes, edges } = convertToReactFlow(saved);
        setNodes(nodes);
        setEdges(edges);
        // toast.success("Workflow loaded!");
      } catch (err) {
        console.error("Failed to load workflow", err);
      }
    };

    loadInitialWorkflow();
  }, []);

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
          nodeTypes={NodeTypes}
          edges={edges}
          onInit={onInit}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={handlePaneClick}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* Edit Label Box Floating */}
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
                onClick={deleteSelectedNode}
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
                value={nodes.find(n => n.id === selectedNode.id)?.data.label || ''}
                onChange={(e) =>
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, label: e.target.value } }
                        : n
                    )
                  )
                }
                style={{ width: 'fit-content', marginTop: '4px', padding: '4px' }}
              />
            </div>
          </div>
        )}

        <FlowCanvasButtons
          onSimulate={handleSimulate}
          onExport={handleExport}
          onDownload={handleDownload}
          onSave={handleSave} 
        />

      </div>

      {/* Right: Config Sidebar */}
      <NodeConfigPanel
        selectedNode={selectedNode}
        onUpdateNode={onUpdateNode}
        onClose = {() => setSelectedNode(null)}
        configPanelRef={configPanelRef}
      />
    </div>
  );
};

const FlowCanvas = () => (
  <ReactFlowProvider>
    <InnerFlowCanvas />
  </ReactFlowProvider>
);

export default FlowCanvas;