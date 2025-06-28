// src/hooks/useFlowLogic.js
import { useCallback, useState } from 'react';
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'react-flow-renderer';

let nodeId = 1;
const getNodeId = () => `node_${nodeId++}`;

export default function useFlowLogic(setNodes, setEdges, reactFlowWrapper, reactFlowInstance) {
  const [selectedNode, setSelectedNode] = useState(null);

  const onInit = (_instance) => {
    reactFlowInstance.current = _instance;
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const onDrop = useCallback((event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowWrapper.current || !reactFlowInstance.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.current?.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') return;

    const newNode = {
      id: getNodeId(),
      type: 'default',
      position,
      data: { label: `${type} Node`, type, config: {} },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, reactFlowInstance, reactFlowWrapper]);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  return {
    onInit,
    onConnect,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    onDrop,
    onDragOver,
    selectedNode,
    setSelectedNode,
  };
}
