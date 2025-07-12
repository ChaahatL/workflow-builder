import { useRef, useState, useEffect } from 'react';
import { NodeTypes } from './nodes/CustomNodes';
import NodeConfigPanel from './NodeConfigPanel';
import {toast} from 'react-toastify'
import { savedWorkflow, loadWorkflow, executeWorkflow} from '../api/workflowAPI';
import useWorkflowState from "../hooks/useWorkflowState"
import { transformWorkflow, convertToReactFlow, downloadJSON } from '../utils/workflowTransform';
import FlowCanvasButtons from "../components/FlowCanvasButtons";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from 'react-flow-renderer';

const InnerFlowCanvas = () => {
  const [loading, setLoading] = useState(false);
  const [execError, setExecError] = useState(null);

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

  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

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
    const transformedNodes = transformWorkflow(nodes, edges);  // returns nodes only

    const payload = {
      name: `Workflow - ${new Date().toLocaleString()}`,
      description: "Created from UI",
      nodes: transformedNodes,  // ← should be array, not JSON.stringify()
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    console.log("Payload being sent to backend:", payload);

    const response = await savedWorkflow(payload);
    console.log('Saved workflow response:', response);
  };

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

  const handleSimulate = async () => {

    if (!query.trim()) {
      toast.error("Please enter a query first");
      return;
    }

    setLoading(true);
    setExecError(null);

    try {
      const transformedNodes = transformWorkflow(nodes, edges);

      // 🔍 Step: Extract uploaded documents from DocumentInput nodes
      const documents = transformedNodes
      .filter(node => node.type === 'DocumentInput' && node.config?.content)
      .map(node => ({
        name: node.config.fileName,
        content: node.config.content,
      }));

      const payload = {
        name: `Workflow - ${new Date().toLocaleString()}`,
        description: "Created from UI",
        nodes: transformedNodes,
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      };

      const saveResponse = await savedWorkflow(payload, documents);
      const workflowId = saveResponse.id;
      if (!workflowId) throw new Error("❌ Failed to get workflow ID");

      const execResponse = await executeWorkflow(workflowId, query); // Send query here

      // Update chat messages
      setChatMessages((prev) => [
        ...prev,
        { sender: "user", message: query },
        { sender: "bot", message: execResponse.output?.result || "No response" },
      ]);
    } catch (err) {
      setExecError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const { nodes: rawNodes, edges: rawEdges } = transformWorkflow(nodes, edges);
    const structured = {
      name: 'Export Workflow',
      description: 'Exported from UI',
      nodes: rawNodes,
      edges: rawEdges,
    };
    console.log(structured);
  };

  const handleDownload = () => {
    const { nodes: rawNodes, edges: rawEdges } = transformWorkflow(nodes, edges);
    const structured = {
      name: 'Downloaded Workflow',
      description: 'Exported from UI',
      nodes: rawNodes,
      edges: rawEdges,
    };
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

        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleSimulate}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Run
          </button>
        </div>

        <FlowCanvasButtons
          onSimulate={handleSimulate}
          onExport={handleExport}
          onDownload={handleDownload}
          onSave={handleSave}
          loading={loading}
        />

        {loading && <div style={{ marginTop: 16 }}>Running workflow...</div>}
        {execError && <div style={{ marginTop: 16, color: 'red' }}>Error: {execError}</div>}

        {chatMessages.length > 0 && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#f4f4f4', borderRadius: '8px' }}>
            <h4>Chat History</h4>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    margin: '4px 0',
                    borderRadius: '6px',
                    backgroundColor: msg.sender === 'bot' ? '#eee' : '#d1ffd6',
                    maxWidth: '70%',
                  }}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        )}

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