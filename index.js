const express = require("express");
require("dotenv").config();
const cors = require("cors");
const colors = require("colors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 5000;

console.log(process.env.PORT || 9000);

// middleware
app.use(cors());
app.use(express.json());

// MongoDB

// const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.xmhqmx1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb://localhost:27017/`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const eventCollection = client.db("tib-mis").collection("events");
    const filterCollection = client.db("tib-mis").collection("filter");
    const userCollection = client.db("tib-mis").collection("users");

    // event post
    app.post("/api/v1/event", async (req, res) => {
      const event = req.body;
      const result = await eventCollection.insertOne(event);
      res.send(result);
      console.log(result);
      //   res.send({ code: 200, message: "Data Revived" });
    });

    // getAll Events
    app.get("/api/v1/events", async (req, res) => {
      const cursor = await eventCollection.find().sort({ _id: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get Single Event
    app.get("/api/v1/event/:id", async (req, res) => {
      const id = req.params.id;
      if (id.length < 24) {
        return;
      }
      const cursor = { _id: new ObjectId(id) };
      const result = await eventCollection.findOne(cursor);
      res.send(result);
    });

    // delete event
    app.delete("/api/v1/event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // edit event
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

      console.log(result);
      //   console.log(updateEvent);
      res.send(result);
    });

    // event Filter post
    app.post("/api/v1/filter-event", async (req, res) => {
      const data = req.body;
      const { year, month, sectorName, cccName, clusterName, eventName } = data;

      let endEventDate;

      if (year && !month) {
        endEventDate = `^${year}-`;
      } else {
        switch (month) {
          case "January":
            endEventDate = `^${year}-01-`;
            break;
          case "February":
            endEventDate = `^${year}-02-`;
            break;
          case "March":
            endEventDate = `^${year}-03-`;
            break;
          case "April":
            endEventDate = `^${year}-04-`;
            break;
          case "May":
            endEventDate = `^${year}-05-`;
            break;
          case "June":
            endEventDate = `^${year}-06-`;
            break;
          case "July":
            endEventDate = `^${year}-07-`;
            break;
          case "August":
            endEventDate = `^${year}-08-`;
            break;
          case "September":
            endEventDate = `^${year}-09-`;
            break;
          case "October":
            endEventDate = `^${year}-10-`;
            break;
          case "November":
            endEventDate = `^${year}-11-`;
            break;
          case "December":
            endEventDate = `^${year}-12-`;
            break;
          default:
            console.log("Invalid month");
            break;
        }
      }

      const result = await eventCollection
        .find({
          ...(cccName && { "genInfo.cccName": cccName }),
          ...(clusterName && { "genInfo.clusterName": clusterName }),
          ...(sectorName && { "genInfo.sectorName": sectorName }),
          ...(eventName && { "genInfo.eventName": eventName }),
          ...(endEventDate && {
            "genInfo.endEventDate": { $regex: endEventDate },
          }),
          // "genInfo.endEventDate": { $regex: "^2023-" },
        })
        .toArray();

      await filterCollection.deleteMany({});
      const id = await filterCollection.insertOne({ result });
      // console.log(id);
      // console.log(result);
      console.log(id);
      res.send(result);
    });

    // get filter event
    app.get("/api/v1/filter-event", async (req, res) => {
      const result = await filterCollection.find().toArray();
      console.log(result);
      res.send(result);
    });

    //--------------- User -------------- //
    // Add New User
    app.post("/api/v1/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
      console.log(user);
    });

    // get all user
    app.get("/api/v1/user", async (req, res) => {
      const cursor = await userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
      console.log(result);
    });
    // get single user
    app.get("/api/v1/user/:id", async (req, res) => {
      const id = req.params.id;
      if (id.length < 24) {
        return;
      }
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    // delete user
    app.delete("/api/v1/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(filter);
      res.send(result);
    });

    // Update User
    app.put("/api/v1/user/:id", async (req, res) => {
      const id = req.params.id;
      const newUser = req.body;
      const cursor = { _id: new ObjectId(id) };
      const result = await userCollection.updateOne(cursor, {
        $set: {
          name: newUser.name,
          number: newUser.number,
          email: newUser.email,
          password: newUser.password,
          userType: newUser.userType,
          userStatus: newUser.userStatus,
          idCard: newUser.idCard,
        },
      });

      //   name,
      //   number,
      //   email,
      //   password,
      //   userType,
      //   userStatus,
      //   idCard,
      // const
      res.send(result);
      // console.log(newUser);
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
