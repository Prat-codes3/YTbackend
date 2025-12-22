import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

const connectDB= async ()=>{
    try {
        const uri=process.env.MONGODB_URI
        if(!uri){console.log("not uri")}
        const connectionInstance=await mongoose.connect(`${uri}`)
        console.log(`\n MOngoBD connected !! DB HOST:${connectionInstance.connection.host}`)
    } catch (error) {
           console.error("ERROR db not connected",error)
       // throw error or u can use proces.exit(1)
           process.exit(1)
    }
}

export default connectDB