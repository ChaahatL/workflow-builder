const componentList = ['UserQuery', 'KnowledgeBase', 'LLMEngine', 'Output'];

const onDragStart = (event, nodeType) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const NodePanel = () => {
  return (
    <div style={{width: 'max-content'}}>
      <h3>Components</h3>
      {componentList.map((type) => (
        <div
          key={type}
          className="draggable-node"
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid black',
            cursor: 'grab',
            background: 'white'
          }}
        >
          {type}
        </div>
      ))}
    </div>
  );
};

export default NodePanel;
