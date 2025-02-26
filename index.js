const express = require("express");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const port = process.env.PORT || 3000;
const corsOptions = {
  origin: "*", // Allow all origins (change in production)
  Credential: true
};

app.use(cors());

// Handle OPTIONS requests (Preflight Requests)
app.options("*", cors(corsOptions));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9jins.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient instance
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB once at startup
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}
connectDB();

const coffeeCollection = client.db("coffeeDB").collection("coffees");

// API Routes
app.get("/", (req, res) => {
  res.send("Hello, welcome to the Coffee API!");
});

app.get("/addCoffee", async (req, res) => {
  try {
    const result = await coffeeCollection.find({}).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coffee data." });
  }
});

app.get("/coffee/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await coffeeCollection.findOne(query);
    if (!result) {
      return res.status(404).json({ error: "Coffee not found." });
    }
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format or database error." });
  }
});

app.post("/addCoffee", async (req, res) => {
  try {
    const addData = req.body;
    const result = await coffeeCollection.insertOne(addData);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add coffee." });
  }
});

app.patch("/updateCoffee", async (req, res) => {
  try {
    const updateData = req.body;
    const filter = { _id: new ObjectId(updateData.id) };
    const updateDoc = {
      $set: {
        name: updateData.name,
        chef: updateData.chef,
        supplier: updateData.supplier,
        taste: updateData.taste,
        category: updateData.category,
        details: updateData.details,
        photo: updateData.photo,
      },
    };
    const result = await coffeeCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update coffee." });
  }
});

app.delete("/coffee/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await coffeeCollection.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Coffee not found." });
    }
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete coffee." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
