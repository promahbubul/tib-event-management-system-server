const express = require("express");
require("dotenv").config();
const cors = require("cors");
const colors = require("colors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000; // Ensure the port is read from the environment

console.log(`Server will run on port: ${port}`); // Log the port for debugging
console.log(`Server will run on port: ${process.env.USER_NAME}`); // Log the port for debugging
console.log(`Server will run on port: ${process.env.USER_PASS}`); // Log the port for debugging

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.xmhqmx1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const eventCollection = client.db("tib-mis").collection("events");

    // Event post
    app.post("/api/v1/event", async (req, res) => {
      const event = req.body;
      const result = await eventCollection.insertOne(event);
      res.send(result);
      console.log(result);
    });

    // Get all events
    app.get("/api/v1/events", async (req, res) => {
      const cursor = eventCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single event
    app.get("/api/v1/event/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID");
      }
      const cursor = { _id: new ObjectId(id) };
      const result = await eventCollection.findOne(cursor);
      res.send(result);
    });

    // Delete event
    app.delete("/api/v1/event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventCollection.deleteOne(query);
      res.send(result);
    });

    // Edit event
    app.put("/api/v1/event/:id", async (req, res) => {
      const id = req.params.id;
      const updateEvent = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const newEvent = {
        $set: {
          genInfo: { ...updateEvent.genInfo },
          programDetails: { ...updateEvent.programDetails },
          participants: { ...updateEvent.participants },
        },
      };
      const result = await eventCollection.updateOne(filter, newEvent, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!".bgGreen
        .white
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("<h1>TiB eMs | Event Management System</h1>");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`.bgBlue.white);
});
