import {asyncHandler} from "../utils/async_handler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/ApiResponse.js"

const registerUser= asyncHandler(async (req,res)=>{
    
    //get user details from frontend
    //validation - not empty
    //check if user already exists : by username,email 
    //check if files present(here images and avatar)
    //if available then upload to cloudinary,again check if avatar is uploaded successfuly
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //if created return response
    const {fullname,email,username,password}=req.body    //attributes shd be same as in our user model
    console.log("email : ",email)
     //note: Form ya json se data aa rha he to .body me mil jyega

     if(fullname===""){       //check if fullname is not null
       throw new ApiError(400,"fullname is required")
     }
         //smart check
     if([fullname,email,username,password].some((field)=> field?.trim()==="")){
       throw new ApiError(400,"all fields is required")
     }
      
     //check if user already exists
     const existingUser=User.findOne({$or: [{username} , {email}]})
     if(existingUser){throw new ApiError(409,"User already exists")}


    //check if avatar and files are uploaded
     const avatarLocalPath=req.files?.avatar[0]?.path
     const coverImageLocalPath=req.files?.coverImage[0]?.path

     if(!avatarLocalPath){throw new ApiError(400,"Avatar to lgega bhai")}

    //upload avatar and coverimage on cloudinary
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    //check again if avatar is uploaded
    if(!avatar){throw new ApiError(400,"Avatar to lgega bhai")}

    //now create user object and upload on db
    const newuser=await User.create({fullname, avatar:avatar.url, coverImage:coverImage?.url || "", email,password,username: username.toLowerCase()})
     
    const createduser= await User.findById(newuser._id).select("-password -refreshToken")
    
    //check if user is created 
    if(!createduser){throw new ApiError(509,"something went wrong while registering user")}

    return res.status(201).json( new Apiresponse(200,createduser,"user registered succesfully"))
}); //regesterUser ends here


export {registerUser}