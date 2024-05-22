var express = require("express");
var app = express();
app.use(express.static(__dirname + '/public')); // Specify public directory
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://hassan:7rF30j14IOS44u7K@cluster0.wtxmdcj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const http = require("http").createServer(app); // Create HTTP server using Express
const io = require('socket.io')(http); // Use HTTP server for Socket.IO

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    const interval = setInterval(() => {
        socket.emit("number", parseInt(Math.random() * 10));
    }, 1000);

    // Clear the interval when the socket disconnects
    socket.on("disconnect", () => {
        clearInterval(interval);
    });
});

async function run() {
    try {
        await client.connect();
        await client.db("Cars").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        await client.close();
    }
}

app.post('/api/cars', async (req, res) => {
    let car = req.body;
    let result = await postCar(car);
    client.close();
    res.json({ statusCode: 201, message: 'success', data: result });
});

async function postCar(car) {
    await client.connect();
    let collection = await client.db('Cars').collection('Info');
    return collection.insertOne(car);
}

app.get('/api/cars', async (req, res) => {
    let result = await getAllCars();
    client.close();
    res.json({ statusCode: 201, message: 'success', data: result });
});

async function getAllCars() {
    await client.connect();
    let collection = await client.db('Cars').collection('Info');
    return collection.find().toArray();
}

// Serve index.html file when accessing root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
    console.log("App listening on port: " + port);
});
