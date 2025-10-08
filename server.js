const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); // add mongoose here

const routeRoutes = require('./routes/routeRoutes');
const busRoutes = require('./routes/busRoutes');
const tripRoutes = require('./routes/tripRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('view'));

const mongoURI = 'mongodb+srv://ntcadmin:123ASDF00nkw@cluster0.2wxtosm.mongodb.net/bus_tracking';

const maxRetries = 5;
let retries = 0;

function connectWithRetry() {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('✅ MongoDB connected');
    })
    .catch(err => {
      console.error(`❌ MongoDB connection error: ${err}`);
      if (retries < maxRetries) {
        retries++;
        console.log(`Retrying connection (${retries}/${maxRetries}) in 5 seconds...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error('Failed to connect to MongoDB after multiple attempts.');
      }
    });
}

connectWithRetry();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

// API routes
app.use('/routes', routeRoutes);
app.use('/buses', busRoutes);
app.use('/trips', tripRoutes);
app.use('/search', searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);