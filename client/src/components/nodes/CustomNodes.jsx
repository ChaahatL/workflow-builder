export const NodeTypes = {
  UserQuery: ({ data }) => (
    <div style={{ padding: 10, border: '1px solid #2196f3', borderRadius: 6, background: '#e3f2fd' }}>
      <strong>User Query</strong>
      <div>{data.label}</div>
    </div>
  ),

  KnowledgeBase: ({ data }) => (
    <div style={{ padding: 10, border: '1px solid #4caf50', borderRadius: 6, background: '#e8f5e9' }}>
      <strong>Knowledge Base</strong>
      <div>{data.label}</div>
    </div>
  ),

  LLMEngine: ({ data }) => (
    <div style={{ padding: 10, border: '1px solid #ff9800', borderRadius: 6, background: '#fff3e0' }}>
      <strong>LLM Engine</strong>
      <div>{data.label}</div>
    </div>
  ),

  Output: ({ data }) => (
    <div style={{ padding: 10, border: '1px solid #f44336', borderRadius: 6, background: '#ffebee' }}>
      <strong>Output</strong>
      <div>{data.label}</div>
    </div>
  ),

  Initial: ({ data }) => (
    <div style={{ padding: 10, border: '1px solid #9c27b0', borderRadius: 6, background: '#f3e5f5' }}>
      <strong>Start</strong>
      <div>{data.label}</div>
    </div>
  ),
};