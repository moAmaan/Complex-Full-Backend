
import { app } from "./app.js";
import dbConnect from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path : "./env"
})

dbConnect()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Not able to connect to database error : ",error);
        throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is runninng on port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("Server not connected",error);
})


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