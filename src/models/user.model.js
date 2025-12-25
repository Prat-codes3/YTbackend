import dotenv from "dotenv"
dotenv.config({ path: "D:/YTBackend/.env" });

import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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


userSchema.pre("save",async function(next){
    if(!this.isModified("password")){return next();}

    this.password= await bcrypt.hash(this.password,10)
    next()

    //hame password ko encrypt krna tha before saving isliye hamne ".pre()"hook use kara
    //pre ke andar hamne "save"  diya to tell pre ki save krne se pehe ye wala kam krna he
    //and ek callback function diya ki ye operation perform krna he
    //then hamne function ke andar password ko hash krdiya ,hashing me 10 rounds kre
    //ab dikkat ye thi ki agr hmne koi aur variable/field(for example : avatar)  schema ke andar modify kra and then save kra tb bhi hamara password firse hash hoga
    //isliye hamne if() condition lagayi ki password jab modify ho tbhi hash krna 
    //aur ab kyuki ye middleware he to next pass krdiya last mai 
})

//add custom methods to userSchema
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);//this.password has encrypted password
     //returns true or false
}

userSchema.methods.generateAccessToken= function(){
    return jwt.sign({
        //payload
        id:this._id ,//ye hme mongodB se milegi
        email:this.email,
        username: this.username,
        fullname: this.fullname
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken=function(){return jwt.sign({
        //payload
        id:this._id ,//ye hme mongodB se milegi
    },process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})}
export const User = mongoose.model("User",userSchema)
