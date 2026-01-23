//this middle ware will verify if user he ya nhi he
import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/async_handler"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model"
import dotenv from "dotenv"
dotenv.config({path:"D:/YTBackend/.env"})

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")           //hmare pass req me cookies ka access he cuz hmne hi app.use(cookieparser()) kra tha
        
        if(!token){throw new ApiError(401,"unauthorized request")}
        
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if(!user){throw new ApiError(401,"Invalid Access Token")}
        
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})