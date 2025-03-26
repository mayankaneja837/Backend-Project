import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUDNAME , 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET
});

const uploadonCloudinary=async (localfilePath)=>{
    try{
        if(!localfilePath){
            return null;
        }
        const response=await cloudinary.uploader.upload(localfilePath,{
            resource_type:"auto"
        })
        console.log("File has been uploaded on cloudinary")
        console.log(response.url)
        return response
    }catch(error){
        fs.unlinkSync(localfilePath)
         //to remove the locally saved file from the server as operation got failed
        return null;
    }
}

export {uploadonCloudinary}