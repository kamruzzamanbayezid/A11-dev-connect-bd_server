const express = require('express')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
      origin: [
            'http://localhost:5173',
      ],
      credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// verify token
const verifyToken = (req, res, next) => {
      const token = req.cookies.token;
      if (!token) {
            return res.status(401).send({ message: 'Unauthorized Access' })
      }
      jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
            if (err) {
                  res.status(401).send({ message: 'Unauthorized Access' })
            }
            req.user = decoded
            next()
      })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d8abmis.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
      serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
      }
});

async function run() {
      try {
            // Connect the client to the server	(optional starting in v4.7)
            // await client.connect();

            const allJobCollection = client.db("dev-connect-bd-DB").collection('allJobs');
            const appliedJobCollection = client.db("dev-connect-bd-DB").collection('appliedJobs');


            // json web token
            app.post('/jwt', async (req, res) => {
                  const user = req.body;
                  const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '1h' })
                  res
                        .cookie('token', token, {
                              httpOnly: true,
                              secure: true,
                              sameSite: 'none',
                        })
                        .send({ message: true })

            })

            // clear token
            app.post('/logout', async (req, res) => {
                  const user = req.body;
                  res
                        .clearCookie('token', {
                              maxAge: 0,
                              secure: true,
                              sameSite: 'none',
                        },)
                        .send({ success: true })
            })

            // post job by a logged in user through addAJob
            app.post('/all-jobs', async (req, res) => {
                  const job = req.body;
                  const result = await allJobCollection.insertOne(job);
                  res.send(result)
            })

            // get all jobs that added by logged user
            app.get('/all-jobs', async (req, res) => {
                  const result = await allJobCollection.find().toArray();
                  res.send(result)
            })

            // get job by id || single job || job details
            app.get('/job/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) }
                  const result = await allJobCollection.findOne(query);
                  res.send(result)
            })

            // get job by category
            app.get('/all-jobs/:category', async (req, res) => {
                  const { category } = req.params;
                  let query = { jobCategory: category };
                  const result = await allJobCollection.find(query).toArray();
                  res.send(result);
            });

            // get user job that he added 
            app.get('/my-jobs/:email', verifyToken, async (req, res) => {

                  // verify token owner
                  if (req.params?.email !== req.user?.email) {
                        return res.status(403).send({ message: 'Forbidden' })
                  }

                  const query = { userEmail: req.params?.email }
                  const result = await allJobCollection.find(query).toArray();
                  res.send(result);
            });

            // delete a job by id
            app.delete('/job/:id', async (req, res) => {
                  const result = await allJobCollection.deleteOne({ _id: new ObjectId(req.params?.id) });
                  res.send(result);
            })

            // update myJobs jobs job
            app.put('/job/:id', async (req, res) => {
                  const job = req.body;
                  const query = { _id: new ObjectId(req.params.id) }
                  const options = { upsert: true };
                  const updateDoc = {
                        $set: {
                              ...job
                        },
                  };
                  const result = await allJobCollection.updateOne(query, updateDoc, options)
                  res.send(result)
            })

            // user || applied jobs
            app.get('/applied-jobs', verifyToken, async (req, res) => {

                  // verify token owner
                  if (req.query?.loggedEmail !== req.user?.email) {
                        return res.status(403).send({ message: 'Forbidden' })
                  }

                  let query = {};
                  if (req.query.loggedEmail) {
                        query = { loggedEmail: req.query.loggedEmail };
                  }
                  const result = await appliedJobCollection.find(query).toArray();
                  res.send(result);
            });

            // applied jobs
            app.post('/applied-jobs', async (req, res) => {
                  const job = req.body;
                  const result = await appliedJobCollection.insertOne(job);
                  res.send(result)
            })



            // Send a ping to confirm a successful connection
            // await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
            // Ensures that the client will close when you finish/error
            // await client.close();
      }
}
run().catch(console.dir);


app.get('/', (req, res) => {
      res.send('Dev Connect BD is running')
})

app.listen(port, () => {
      console.log(`Dev Connect BD is running on port ${port}`)
})