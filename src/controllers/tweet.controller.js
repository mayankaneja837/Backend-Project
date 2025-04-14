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



export {
    createTweet
}