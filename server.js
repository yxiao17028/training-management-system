require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const programRoutes = require('./routes/programs');
const registrationRoutes = require('./routes/registrations');
const trainerRoutes = require('./routes/trainers');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads and public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// make io available in req.app.get('io')
app.set('io', io);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/admin', adminRoutes);

// connect to mongodb
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=> {
  console.log('MongoDB Atlas connected');
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, ()=> console.log(`Server listening on ${PORT}`));
})
.catch(err => console.error(err));

// basic socket listeners for real-time notifications
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join', (room) => {
    socket.join(room); // rooms: 'staff','admin' or program-specific
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
  });
});
