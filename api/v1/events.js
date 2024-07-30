// api/v1/events.js
const express = require("express");
const router = express.Router();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.xmhqmx1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const eventCollection = client.db("tib-mis").collection("events");

    // Post event
    router.post("/event", async (req, res) => {
      const event = req.body;
      const result = await eventCollection.insertOne(event);
      res.send(result);
    });

    // Get all events
    router.get("/events", async (req, res) => {
      const cursor = await eventCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single event
    router.get("/event/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const result = await eventCollection.findOne(cursor);
      res.send(result);
    });

    // Delete event
    router.delete("/event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventCollection.deleteOne(query);
      res.send(result);
    });

    // Edit event
    router.put("/event/:id", async (req, res) => {
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
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

module.exports = router;
