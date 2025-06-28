const API_BASE = 'http://localhost:5000/api';

export const savedWorkflow = async (workflowData) => {
    const response = await fetch(`${API_BASE}/workflow`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(workflowData),
    });
    return response.json();
};

export const loadWorkflow = async () => {
    const response = await fetch(`${API_BASE}/workflow`);
    return response.json();
};