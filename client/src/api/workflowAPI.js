const API_BASE = 'https://workflow-builder-backend.onrender.com/api';

export const savedWorkflow = async (workflowData) => {
  const response = await fetch(`${API_BASE}/create_workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflowData),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Backend error:", data);
  }

  return data;
};

export const loadWorkflow = async () => {
    const response = await fetch(`${API_BASE}/workflows`);
    return response.json();
};

export const executeWorkflow = async (workflowId) => {
  const response = await fetch(`${API_BASE}/execute_workflows/${workflowId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // No body needed unless your backend expects something else
  });
  if (!response.ok) {
    throw new Error('Failed to execute workflow');
  }
  return response.json();
};
