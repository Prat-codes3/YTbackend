import mongoose,{Schema} from "mongoose"

const userSchema = new Schema({
    username:{
        type:String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required: true,
        unique:true,
        lowercase:true,
        trim:true
    },
      fullname:{
        type:String,
        required: true,
        trim:true,
        index:true
    },
      avatar:{
        type:String, //cloudinary url we will be using for ex
        required: true 
    },
    coberImage:{
        type: String, //cloudinary url
    },
    watchHistory:[ {    //watchhisory is array of objects
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required: [true,"Password is required"] //u can give custom message with any true field
    },
    refreshToken:{
        type: String
    }

},{timestamps:true});


export const User = mongoose.model("User",userSchema)
