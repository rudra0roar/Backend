// require('dotenv').config({path : './env'})

import dotenv from 'dotenv';
import mongoose from "mongoose";
import {DB_NAME}  from './contants.js';
import dbConnect from './db/index.js';
import {app} from './app.js'


dotenv.config({
    path : './env'
})


dbConnect()
.then(() => {
    app.on('error' , (error) => {
        console.log("Error in DB Connection: " , error);
    })
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at Port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Mongo DB connection failed : " , error);
})




























































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