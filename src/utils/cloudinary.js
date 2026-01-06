import dotenv from "dotenv"
dotenv.config({ path: "D:/YTBackend/.env" });
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"  //for file handling and this is inbuilt in nodejs


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async(localeFilePath)=>{
    try {
        if(!localeFilePath)return null;
        //upload the file on cloudinary
       const response=await cloudinary.uploader.upload(localeFilePath,{resource_type:"auto"})
        //file has been uploaded successsfulyy
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localeFilePath) //removes the locallly saved temperory file as the upload opeartion got failed
        return null;
    }
}

export {uploadOnCloudinary}