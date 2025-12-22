// require('dotenv').config({path:'./env'}) or u cn do
// console.log("CWD =", process.cwd());
import dotenv from "dotenv"
//   const result =dotenv.config({ path:'./env'}) //configure dotenv as soon as possible
const result=dotenv.config({ path: "D:/YTBackend/.env" });  //.env didnt work so we gave full
/*   console.log(result) 
   console.log("HEloooooooo")
 console.log("URI =", process.env.MONGODB_URI); we did this to check if contents of .env are being loaded */




 
// import mongoose  from "mongoose";
// import { DB_NAME } from "./constants";  we did this in aour seperate bd/index.js file
import connectDB from "./db/index.js" 






/*
(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
    } catch (error) {
        console.error("ERROR",error)
        throw error
    }
})()                   u can connect database diresctly using IIFE  or u can make sepearte folders to store your code and then import from there ,we are doing importing in this project*/



connectDB().then(()=>{
    
    app.listen(process.env.PORT|| 8000, ()=>{
        console.log(`server is running at port: ${process.env.PORT}`)
    })
}).catch((error)=>{console.log("MONGODB connection failed!!",error)});