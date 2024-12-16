import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const dbConnect = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MOngoose database connected ! DB Host : ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("DB connection Error : ",error);
        process.exit(1);
    }
}

export default dbConnect