const express = require('express')
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




app.get('/', (req, res) => {
      res.send('Dev Connect BD is running')
})

app.listen(port, () => {
      console.log(`Dev Connect BD is running on port ${port}`)
})