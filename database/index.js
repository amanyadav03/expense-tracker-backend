const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.DB_URL;

const connectDB = () =>{
    mongoose.connect(url).then(()=>{
        console.log('Connected to MongoDB.....');
    }).catch((error)=>{
        console.log('Error connecting to MongoDB.....', error);
    })
} 

module.exports = connectDB;