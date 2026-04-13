import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";
import https from "https";

dotenv.config({
    path: './.env'
});

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("error:",error);
        throw error
        
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at the port : ${process.env.PORT}`);
        
        // Anti-Sleep Self-Ping Mechanism
        const RENDER_URL = "https://zootube-backend.onrender.com/api/v1/healthcheck";
        setInterval(() => {
            https.get(RENDER_URL, (res) => {
                console.log(`[Self-Ping] Sent keep-alive ping to ${RENDER_URL} - Status: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error(`[Self-Ping Error] Keep-alive ping failed:`, err.message);
            });
        }, 10 * 60 * 1000); // Ping every 10 minutes (600,000 ms)
    })
})
.catch((error)=>{
    console.log("MongoDB connection Failed!!",error);
})
























/*
import express from "express"
const app = express()

(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

       app.on("error",(error)=>{
        console.log("Error: ",error)
        throw error
       });

       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
       })


    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})()

 */