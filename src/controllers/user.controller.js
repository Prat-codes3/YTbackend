import {asyncHandler} from "../utils/async_handler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/ApiResponse.js"


const generateAccessAndRefreshToken=async(userId)=>{
  try {

    const user= await User.findById(userId)
    const AccesToken=user.generateAccessToken()
    const RefreshToken=user.generateRefreshToken()
    user.refreshToken=RefreshToken
    await user.save({validateBeforeSave: false}) //validatebeforesave isliye kra cuz hmne user save kra to apna mongoose ka model firse sare checks krega vha hmne password reuired rkha he pr hmne yha pass to nhi kra isliye hm validation off kr rhe he
    return {AccesToken,RefreshToken}  

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
  
  if(!username || !email){
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
    secure: true        
  }
  
  return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
              new Apiresponse(200,{user:loggedInUser,accessToken,refreshToken},"user logged in successfully")
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
    secure: true        
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json( new Apiresponse(200,{},"user logged out"))
    })



export {registerUser,loginUser,logoutUser}