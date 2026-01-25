import {asyncHandler} from "../utils/async_handler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken=async(userId)=>{
  try {
       console.log("SIGN SECRET:", process.env.ACCESS_TOKEN_SECRET)

    const user= await User.findById(userId)
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave: false}) //validatebeforesave isliye kra cuz hmne user save kra to apna mongoose ka model firse sare checks krega vha hmne password reuired rkha he pr hmne yha pass to nhi kra isliye hm validation off kr rhe he
    return {accessToken,refreshToken}  

  } catch (error) {
    throw new ApiError(500,"something went wrong while generating refresh and access tokens")
  }
}


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
    console.log("email: ",email)
     //note: Form ya json se data aa rha he to .body me mil jyega

     if(fullname===""){       //check if fullname is not null
       throw new ApiError(400,"fullname is required")
     }
         //smart check
     if([fullname,email,username,password].some((field)=> field?.trim()==="")){
       throw new ApiError(400,"all fields is required")
     }
      
     //check if user already exists
     const existingUser=await User.findOne({$or: [{username} , {email}]})
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


const loginUser=asyncHandler(async(req,res)=>{
  //req.body -> data
  //username or email
  //find the user
  //if found password check
  //access and refresh token generate and send to user
  //we send tokens through secure cookies
  const{email,username,password}=req.body
  
  if(!(username || email)){
    throw new ApiError(400,"username or email is required")
  } 

  const user=await User.findOne({
    $or:[{username},{email}]
  })
  
  if(!user){
    throw new ApiError(404,"user not found")
  }

  const isPasswordValid=await user.isPasswordCorrect(password)    //isme password vo wala pass kiya he jo user ne abhi dala//we access methods we made in User Schema through "user" the instance and not User
     if(!isPasswordValid){
    throw new ApiError(401,"Password is wrong")
  }
    
  const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
  
  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
  
  const options ={
    httpOnly: true,     //ye options object cookies ke liye he  httponly and secure true krne se cookies bds backend wale modify kr skte he not frontend wale
    secure:  process.env.NODE_ENV === "production"        
  }
  
  return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
              new Apiresponse(200,{user:loggedInUser,accessToken:accessToken,refreshToken:refreshToken},"user logged in successfully")
            )


})//user login ends here

const logoutUser=asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(req.user._id ,    //find by id bh kr skte the pr fir vo user lana pdega then uska refresh token empty krna pdega then usko save krna pdega
           {                                   //aur ye req.user hmne khud banaya tha authentication middleware me using jwt then ye verifyJWT middleware hmne lgout wale route me use kra he in user.routes
            $set:{
              refreshToken: undefined    //ye set mongodb ka ek operator he jo update krdeta he jo hmne use batyaa 
            }                  
           } , {
            new:true     //return me jo response jyega usme ab hme new updated data jyega
           } 
    )

     const options ={
    httpOnly: true,     //ye options object cookies ke liye he  httponly and secure true krne se cookies bds backend wale modify kr skte he not frontend wale
     secure: process.env.NODE_ENV === "production"   //ekbar secure : true se bhi dekhle har jgh pe      
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json( new Apiresponse(200,{},"user logged out"))
    })//user logout ends here

   
   
    //endpoint for refresh access token
   const refreshAccessToken= asyncHandler(async(req,res)=>
    { 
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken  //website ya app se aya hua refresh token
    
    if(!incomingRefreshToken){
      throw new ApiError(401," refresh token is missing")
    }
 
    try {
      const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      
      const user=await User.findById(decodedToken?._id)
      if(!user){
        throw new ApiError(401,"Invalid Refresh Token")
      }
  
      if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401,"refresh token expired or used")
      }
      
      const options={
        httpOnly:true,
        secure:process.env.NODE_ENV === "production"
      }
      const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
  
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newrefreshToken,options)
      .json(new Apiresponse(200,{accessToken,refreshToken:newrefreshToken},"accesstoken refreshed"))
    } 
    catch (error) {
      throw new ApiError(401,error?.message || "Invalidss Refresh Token")
    }
  })

  const changePassword= asyncHandler (async(req,res)=>{
    //get user id from req.user
    //get old password and new password from req.body
    //find user from db
    //compare old password
    //if matches then update with new password
    //save user
    //return response
    const userId= req.user._id
    const {oldPassword,newPassword}= req.body
    const user= await User.findById(userId)
    if(!user){
      throw new ApiError (404,"user not found")
    }
    const isOldPasswordValid= await user.isPasswordCorrect(oldPassword)
    if(!isOldPasswordValid){
      throw new ApiError (401,"old password is incorrect")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json (new Apiresponse(200,{},"password changed successfully"))

  })

  const getCurrentUser= asyncHandler (async (req,res)=>{
    const userId= req.user._id
    const user= await User.findById (userId).select ("-password -refreshToken") 
    if(!user){
      throw new ApiError (404,"user not found")
    }
    return res.status(200).json (new Apiresponse (200,user,"current user fetched successfully"))
  })

  const updateUserProfile= asyncHandler (async (req,res)=>{
    //get user id from req.user
    //get updated fields from req.body
    //find user from db
    //update fields
    //if avatar or cover image is there then upload to cloudinary
    //save user
    //return response
    
    const userId= req.user._id
    const {fullname,email}= req.body
        //check if avatar and cover image are there in req.files
    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath= req.files?.coverImage[0]?.path

 if (!fullname && !email && !avatarLocalPath && !coverImageLocalPath) {
  throw new ApiError(400, "At least one field is required");
}

    const user= await User.findById (userId)
    if(!user){
      throw new ApiError (404,"user not found")
    }
  if (fullname) user.fullname = fullname;
  if (email) user.email = email;     


  if(avatarLocalPath){
      const avatar= await uploadOnCloudinary (avatarLocalPath)
      if(!avatar){
        throw new ApiError (500,"something went wrong while uploading avatar")
      }
      user.avatar= avatar.url
    }
  if(coverImageLocalPath){
      const coverImage= await uploadOnCloudinary (coverImageLocalPath)
      if(!coverImage){
        throw new ApiError (500,"something went wrong while uploading cover image")
      }
      user.coverImage= coverImage.url
    }
    await user.save ({validateBeforeSave:false})
    const updatedUser= await User.findById (userId).select ("-password -refreshToken")
    
    return res.status (200).json (new Apiresponse (200,updatedUser,"user profile updated successfully"))
  })

export {registerUser,loginUser,logoutUser,refreshAccessToken, changePassword, getCurrentUser, updateUserProfile}