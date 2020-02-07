require('dotenv').config();

//Database
const mongoose = require('mongoose');
//let mongodbUri = 'mongodb://localhost/carbizdb?retryWrites=true';
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
mongoose.connection.once('once', () => {
    console.log('Connection to Mongo carbizdb is established');
});


//Application Server
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

//Router definition
const appointmentRouter = require('./router');

app.use('/appointments', appointmentRouter);

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});


