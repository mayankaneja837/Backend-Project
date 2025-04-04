import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;

    if (!fs.existsSync(localfilePath)) {
      console.log("File does not exist at:", localfilePath);
    }

    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localfilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilePath);
    //to remove the locally saved file from the server as operation got failed
    return null;
  }
};

export { uploadonCloudinary };
