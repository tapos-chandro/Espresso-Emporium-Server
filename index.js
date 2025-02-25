const express = require("express");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const port = process.env.PROT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9jins.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const coffeeCollection = client.db("coffeeDB").collection("coffees");

async function run() {
  try {
    await client.connect();

    app.get("/addCoffee", async (req, res) => {
      const result = await coffeeCollection.find({}).toArray();
      res.send(result);
    });


    app.get('/coffee/:id', async(req, res ) => {
      const id = req.params.id
      console.log(id)

      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query)
      res.send(result)
    })



    app.post("/addCoffee", async (req, res) => {
      const addData = req.body;
      const result = await coffeeCollection.insertOne(addData);
      res.send(result);
    });


    app.patch("/updateCoffee", async (req, res) => {

      const updateData = req.body;
      let filter = {_id : new ObjectId(updateData.id)} 
      const updateDoc = {
        $set: {
          name: updateData.name,
          chef: updateData.chef,
          supplier: updateData.supplier,
          taste: updateData.taste,
          category: updateData.category,
          details: updateData.details,
          photo: updateData.photo
        },
      };

      const result = await coffeeCollection.updateOne(filter, updateDoc)
      res.send(result)

    })


    app.delete('/coffee/:id', async (req, res) => {
      const idd = req.params.id;
      const query = {_id: new ObjectId(idd)}
      const result = await coffeeCollection.deleteOne(query);
      res.send(result)
    })
    

    
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.log);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
