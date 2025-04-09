import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken=async(userId)=>{
  try{
    const user=await User.findById(userId)
    
    
    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()


    user.refreshToken=refreshToken

    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}

  }catch(error){
    throw new ApiError(500,"Somethig went wrong while generating tokens")
  }
}

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

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath=req.files.coverImage[0].path
  }
  

  if(!avatarlocalPath){
    throw new ApiError(400,"Avatar file  is required")
  }
  
  
  const avatar=await uploadonCloudinary( avatarlocalPath)
  const coverImage=await uploadonCloudinary( coverImageLocalPath)
  

  if(!avatar){
    throw new ApiError(400,"Avatar file is required")
  }
  
  const user=await User.create({
    fullName,
    avatar:avatar,
    coverImage:coverImage || "",
    email,
    password,
    username:username.toLowerCase()
  })
  
  const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )
  
  if(!createdUser){
    throw new ApiError(500,"Something went wrong while finding a user")
  }
  
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )
  
});

const loginUser=asyncHandler(async(req,res)=>{
  const {email,password,username}=req.body

  if(!(username || email)){
    throw new ApiError(400,"username or email is required")
  }

  const user=await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"User with this username or email  does not exist")
  }

  const isPasswordValid=await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Password is not correct")
  }

  const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

  const options={
    httpOnly:true,
    secure:true
  }

  return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{
      user:loggedInUser,refreshToken,accessToken
    },
  "User logged in successfully")
  )


})

const logOutuser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $unset:{
      refreshToken:1
    },
  },{
    new:true
  })

  const options={
    httpOnly:true,
    secure:true
  }
  
  return res
  .status(201)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User logged out successfully")
  )
})

const refreshAccessToken=asyncHandler(async (req,res)=>{
  const token=req.cookies?.refreshToken || req.body.refreshToken

  if(!token){
    throw new ApiError(401,"Incoming refresh token does not exist")
  }
  
  try {
    const decdedToken=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
  
    const user=await User.findById(decdedToken._id)
    if(!user){
      throw new ApiError(404,"User with this refresh token does not exist")
    }
  
    if(token!==user?.refreshToken){
      throw new ApiError(401,"Token and database refresh token doesn't match or expired")
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
  
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
  
    return res.status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(201,{accessToken,refreshToken},"User refresh token generated successfully")
    )
    
  } catch (error) {
    throw new ApiError(500,error?.message ||"Something went wrong while refreshing tokens")
  }
})

const changeCurrentUserPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body

  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Old password is not correct")
  }

  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200)
  .json(
    new ApiResponse(200,{},"password canged successfully")
  )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res.status(201)
  .json(
    new ApiResponse(201,req.user,"User returned successfully")
  )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email}=req.body

  if(!fullName && !email){
    throw new ApiError(400,"Fields are required")
  }

const user= await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        fullName,email
      }
    },
    {new:true}
  ).select("-password")

  return res.status(200)
  .json(
    new ApiResponse(200,user,"User details updated successfully")
  )
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarlocalPath=req.file?.path
  if(!avatarlocalPath){
    throw new ApiError(401,"Avatar file required")
  }
  const newAvatar=await uploadonCloudinary(avatarlocalPath)
  if(!avatar.url){
    throw new ApiError(401,"Error while uploading on cloudinary")
  }
  
  const avatarUpdate=await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      avatar:newAvatar.url
    }
  },{
    new:true
  }).select("-password -refreshToken")

  if(!avatarUpdate){
    throw new ApiError(401,"Error while updating avatar Image in database")
  }

  res.status(201)
  .json(
    new ApiResponse(201,avatarUpdate,"User's avatar updated")
  )

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(403,"Cover image is required")
  }

  const newCoverImage=await uploadonCloudinary(coverImageLocalPath)

  if(!newCoverImage.url){
    throw new ApiError(401,"Cover image url is missing")
  }
  const coverUpdate=await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      coverImage:newCoverImage.url
    }
  },{
    new:true
  }).select("-password -refreshToken")

  if(!coverUpdate){
    throw new ApiError(401,"Error while updatng cover Image in database")
  }

  res.status(201).json(
    new ApiResponse(201,coverUpdate,"Cover Image of user updated successfully")
  )
})

const getUserChannelProfile=asyncHandler(async (req,res)=>{
  const {username}=req.params
  if(!username?.trim()){
    throw new ApiError(400,"Username is missing")
  }

  const channel=await User.aggregate([{
    $match:{
      username:username?.toLowerCase()
    },
  },{
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"channel",
      as:"Subscriber"
    }
  },{
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"subscriber",
      as:"SubscribedTo"
    }
  },{
    $addFields:{
      subscriberCount:{
        $size:"$Subscribers"
      },
      channelSubscribedToCount:{
        $size:"$SubscribedTo"
      },
      isSubscribed:{
        $cond:{
          if:{$in:[req.user?._id,"$Subsribers.subscriber"]},
          then:true,
          else:false
        }
      }
    }
  },{
    $project:{
      fullName:1,
      username:1,
      subscriberCount:1,
      channelSubscribedToCount:1,
      isSubscribed:1,
      avatar:1,
      coverImage:1,
    }
  }])

  if(!channel?.length){
    throw new ApiError(401,"Channel does not exist")
  }

  return res.status(200).json(
    new ApiResponse(200,channel[0],"User's channel fetched successfully")
  )
})

const getUserWatchHistory=asyncHandler(async (req,res)=>{

  const watchHistory=await User.aggregate([
    {
      $match:{
       _id:new mongoose.Types.ObjectId(req.user?._id)
      }
    },{
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"WatchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },{
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])

  return res.status(200)
  .json(
    new ApiResponse(200,watchHistory[0].watchHistory,"watch history fetched successfully")
  )
})

export { registerUser,loginUser,logOutuser,refreshAccessToken,changeCurrentUserPassword,getCurrentUser,updateAccountDetails,
  updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getUserWatchHistory
 };
