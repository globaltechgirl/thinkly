const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: false 
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadRouter = require('./routes/upload');
app.use('/api/uploads', uploadRouter); 

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
