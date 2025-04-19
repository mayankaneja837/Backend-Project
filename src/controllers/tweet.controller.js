import mongoose,{isValidObjectId} from "mongoose";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js";

const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body
    if(!content){
        throw new ApiError(401,"Content is missing")
    }

    const create=await Tweet.create({
        content:content,
        owner:req.user?._id
    })

    if(!create){
        throw new ApiError(400,"Error while creating a tweet")
    }

    res.status(201).json(
        new ApiResponse(201,create,"Tweet created successfully")
    )
})

const getUserTweets=asyncHandler(async(req,res)=>{
    const userId=req.user?._id
    if(!userId){
        throw new ApiError(400,"UserId does not exist")
    }

    console.log("Before tweet creation")
    const tweet=await Tweet.find({owner: new mongoose.Types.ObjectId(userId)}).select(" -createdAt -updatedAt")

    console.log("After tweet creation")
    if(!tweet){
        throw new ApiError(401,"User doesnt have any tweets")
    }

    res.status(200).json(
        new ApiResponse(200,tweet,"User's tweets fetched successfully")
    )
})

const updateTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    const {content}=req.body

    if(!tweetId){
        throw new ApiError(400,"TweetId is missing")
    }

    const validated=isValidObjectId(tweetId)

    if(!validated){
        throw new ApiError(400,"TweetId is not in valid format")
    }

    const tweet=await Tweet.findByIdAndUpdate(tweetId,{
        content:content
    },{
        new:true
    }).select("-owner")

    if(!tweet){
        throw new ApiError(400,"Error while updating a tweet")
    }

    res.status(200).json(
        new ApiResponse(200,tweet,"Tweet updated successfully")
    )
})

const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    if(!tweetId){
        throw new ApiError(400,"Tweet id doesn't exist")
    }

    const validTweetId=isValidObjectId(tweetId)
    if(!validTweetId){
        throw new ApiError(400,"TweetId given is not valid")
    }

    const tweet=await Tweet.findByIdAndDelete(tweetId)
    if(!tweet){
        throw new ApiError(400,"Tweet doesn't exist")
    }
    res.status(200).json(
        new ApiResponse(200,{},"Tweet deleted successfully")
    )
})
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}