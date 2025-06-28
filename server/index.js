// server/index.js
import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let savedWorkFlow = [];  // in-memory for now

app.post('/api/workflow', (req, res) => {
    savedWorkFlow = req.body;
    console.log('Workflow saved:', savedWorkFlow);
    res.json({success: true, message: 'Workflow saved'});
});

app.get('/api/workflow', (req, res) => {
    res.json(savedWorkFlow);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});