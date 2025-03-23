import dotenv from "dotenv"
import express from "express"

const app=express()

dotenv.config({
    path:"./env"
})

import connectDB from "./db/index.js";


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server listening on port ${process.env.PORT}`)
    } )
})
.catch((err)=>{
    console.log("MONGO db connect failed")
})