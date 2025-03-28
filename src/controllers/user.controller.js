import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required ");
  }
  
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  
  const avatarlocalPath=req.files?.avatar[0]?.path
  const coverImageLocalPath=req.files?.coverImage[0]?.path
  
  console.log("avatarlocalPath exists:", Boolean(avatarlocalPath))


  if(!avatarlocalPath){
    throw new ApiError(400,"Avatar file  is required")
  }
  
  console.log("avatarlocalfilepath exists execution continued")

  const avatar=await uploadonCloudinary( avatarlocalPath)
  const coverImage=await uploadonCloudinary( coverImageLocalPath)
  
 
  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }
  
  console.log("checking avatar")
  console.log(avatar)
  const user=await User.create({
    fullName,
    avatar:avatar,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
  })
  
  const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )
  
  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering a user")
  }
  
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )
  
});



export { registerUser };
