require('dotenv').config();
const startQueueCleanup = require("./jobs/queueCleanup");
const { protect, authorize } = require("./middleware/auth");
const tokenRoutes = require('./routes/tokenRoutes');
const { connectRedis } = require('./config/redis');
const express = require('express');

const Port = process.env.PORT || 3000;
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set("io", io);

io.on("connection", (socket)=>{
    socket.on("joinDoctor", (doctorId) =>{
        socket.join(`doctor:${doctorId}`);
    
    })
})


// Middleware to parse JSON requests
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});


const { optionalAuth } = require("./middleware/auth");
app.use(optionalAuth);

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);
app.use('/tokens', tokenRoutes);

app.get("/waiting/:doctorId", (req, res) => {
  res.render("waiting", { doctorId: req.params.doctorId });
});
app.get("/doctor", protect, authorize("doctor"), (req, res) => {
  res.render("doctor", { doctorId: req.user._id.toString() });
});


const startServer = async () => {
    await connectDB();
    await connectRedis();
    server.listen(Port, () => {
        console.log(`Server running on http://localhost:${Port}`);
         startQueueCleanup();
    });
};

startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
});
