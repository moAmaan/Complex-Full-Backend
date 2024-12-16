
import dbConnect from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path : "./env"
})

dbConnect();


// import express from "express";

// const app = express();

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Not able to connect to database error :",error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`server is running on port : ${process.env.PORT}`);
//         })
//     } catch(error){
//         console.log("Error : ", error);
//         throw error;
//     }
// } )()