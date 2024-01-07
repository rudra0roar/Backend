import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";


const dbConnect = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODBURI}/${DB_NAME}`);
        console.log(`\nMongoDB Connected !! DB Host : ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Error : " , error);
        process.exit(1)
    }
}
export default dbConnect