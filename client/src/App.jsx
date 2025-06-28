// App.jsx
import FlowCanvas from "./components/FlowCanvas";
import NodePanel from "./components/NodePanel";
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 'fit-content', borderRight: '1px solid #ddd', padding: '10px' }}>
        <NodePanel />
      </div>
      <div style={{ flexGrow: 1 }}>
        <FlowCanvas />
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}