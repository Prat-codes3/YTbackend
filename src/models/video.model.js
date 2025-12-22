import mongoose, { trusted } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoschema= new mongoose.Schema({
    videoFile:{
        type:String,  //cloudinary url
        required: true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    time:{
        type: Number,
        required:true     
    },
    views:{
        type:Number,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})
    
    export const Video= mongoose.model("Video",videoschema)