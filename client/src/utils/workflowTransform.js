// utils/workflowTransform.js

export const convertToReactFlow = (workflowData) => {
  const nodes = workflowData.map((item, index) => ({
    id: item.id,
    type: 'default',
    position: { x: 100 + index * 100, y: 100 + index * 50 },
    data: {
      label: `${item.type} Node`,
      type: item.type,
      config: {}, // Extend later if needed
    },
  }));

  const edges = [];
  workflowData.forEach((node) => {
    node.next.forEach((targetId) => {
      edges.push({
        id: `${node.id}-${targetId}`,
        source: node.id,
        target: targetId,
        type: 'default',
      });
    });
  });

  return { nodes, edges };
};

export const downloadJSON = (data, filename = 'workflow.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const transformWorkflow = (nodes, edges) => {
    const nodeMap = {};

    // Step 1: Create base nodeMap
    nodes.forEach((node) => {
      const nodeType = node.data?.type || node.data?.label?.split(" ")[0] || "Unknown";
      nodeMap[node.id] = {
        id: node.id,
        type: nodeType,
        next: [],
      };
    });

    // Step 2: Populate next
    edges.forEach((edge) => {
      if (nodeMap[edge.source]) {
        nodeMap[edge.source].next.push(edge.target);
      }
    });

    return Object.values(nodeMap);
  };

export const simulateWorkflow = (nodes, edges) => {
    const workflow = transformWorkflow(nodes, edges);
    const visited = new Set();  // instantly usable
    const result = [];  // easy filtering

    const dfs = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      result.push(`${nodeId} (${node.data.type}): Label = ${node.data.label}`);
      const current = workflow.find((n) => n.id === nodeId);
      current?.next?.forEach(dfs);
    };

    console.log("Starting simulation...");
    dfs("node_0"); // Start from Initial Node
    result.forEach((log) => console.log(log));
    console.log("Simulation completed.");
    
  };