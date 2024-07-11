const express = require('express')
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


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
            app.get('/my-jobs/:email', async (req, res) => {
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

            // ---------------------
            // put/update job by id || single job || increment applicants
            // app.put('/allJobs/applicants/number/:id', async (req, res) => {
            //       const id = req.params.id;
            //       const query = { _id: new ObjectId(id) };
            //       const job = await allJobCollection.findOne(query);
            //       if (job) {
            //             const updatedApplicantsNumber = job.applicantsNumber + 1;

            //             const updateDoc = {
            //                   $set: {
            //                         applicantsNumber: updatedApplicantsNumber
            //                   }
            //             };
            //       }
            //       const result = await allJobCollection.updateOne(query, updateDoc);
            //       res.send(result);
            // })

            // user || applied jobs

            // app.get('/user/appliedJobs', async (req, res) => {

            //       // verify token owner
            //       if (req.query?.loggedEmail !== req.user?.email) {
            //             return res.status(403).send({ message: 'Forbidden' })
            //       }

            //       let query = {};
            //       if (req.query.loggedEmail) {
            //             query = { loggedEmail: req.query.loggedEmail };
            //       }
            //       const result = await appliedJobCollection.find(query).toArray();
            //       res.send(result);
            // });

            // applied jobs
            app.post('/applied-jobs', async (req, res) => {
                  const job = req.body;
                  console.log(job);
                  // const isExist = await appliedJobCollection.findOne({ jobId: job.jobId, loggedUser: job.loggedUser })

                  // if (isExist) {
                  //       res.send({ message: 'Already Added' })
                  //       return;
                  // }
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