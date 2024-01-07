// require('dotenv').config({path : './env'})

import dotenv from 'dotenv';
import mongoose from "mongoose";
import {DB_NAME}  from './contants.js';
import dbConnect from './db/index.js';


dotenv.config({
    path : './env'
})


dbConnect();




























































/*

import  express  from "express";


const app = express()


( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODBURI}/${DB_NAME}`)
        app.on('error' , (error) => {
            console.log("Error: " , error);
        })
        app.listen(process.env.PORT , () => {
            console.log(`App is Listening on PORT: ${process.env.PORT}`);
        })
     
    } catch (error) {
        console.error("Error:" , error);
    }
})()

*/