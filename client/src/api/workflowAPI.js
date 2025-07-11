const API_BASE = 'http://127.0.0.1:8000/api';

export const savedWorkflow = async (workflowData, documents = []) => {
  try {
    const response = await fetch(`${API_BASE}/create_workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: workflowData,
        documents: documents,  // 🆕 Include documents in the request
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Backend error:", data);
      throw new Error(data?.detail || 'Unknown backend error');
    }

    return data;
  } catch (err) {
    console.error("❌ Failed to get workflow ID", err);
    throw err;
  }
};

export const loadWorkflow = async () => {
    const response = await fetch(`${API_BASE}/workflows`);
    return response.json();
};

export const executeWorkflow = async (workflowId, userQuery) => {
  const response = await fetch(`${API_BASE}/execute_workflow/${workflowId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: userQuery })  // ✅ Send required query
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ Backend Error:", errorData.detail);
    throw new Error(`Failed to execute workflow: ${errorData.detail}`);
  }

  return response.json();
};
