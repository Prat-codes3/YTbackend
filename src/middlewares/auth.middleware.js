//this middle ware will verify if user he ya nhi he
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/async_handler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import dotenv from "dotenv"

const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")           //hmare pass req me cookies ka access he cuz hmne hi app.use(cookieparser()) kra tha
        
        if(!token){throw new ApiError(401,"unauthorized request")}
          console.log("VERIFY SECRET:", process.env.ACCESS_TOKEN_SECRET)

        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        
//         console.log("Cookies:", req.cookies);
// console.log("Token:", token); this was done to fix bugs only  vo jwt sign me _id ki jgh id tha attribute name

        if(!user){throw new ApiError(401,"Invalid Access Token")}
        
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})

const optionalVerifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
};
export {verifyJWT, optionalVerifyJWT}