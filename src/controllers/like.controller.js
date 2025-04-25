import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose, {isValidObjectId} from "mongoose"

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    if(!videoId){
        throw new ApiError(400,"VideoId field is required")
    }

    const VidObjectId=mongoose.Types.ObjectId(videoId)
    const video=await Like.findOne({
        video:VidObjectId,
        likedBy:req.user?._id
    })

    if(video){
        await video.deleteOne()
        return res.status(200).json(
            new ApiResponse(200,{},"Video like toggled successfully")
        )
    }

    const like=await Like.create({
        video:videoId,
        likedBy:req.user?._id
    })

    if(!like){
        throw new ApiError(400,"Error while creating a new like")
    }

    res.status(200).json(
        new ApiResponse(200,like,"Video like toggled successsfully")
    )
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    if(!commentId){
        throw new ApiError(400,"CommentId is a required field")
    }

    const validateComment=mongoose.Types.ObjectId(commentId)

    const comment=await Like.findOne({
        comment:validateComment,
        likedBy:req.user?._id
    })

    if(comment){
        await comment.deleteOne()
        return res.status(200).json(
            new ApiResponse(200,{},"Comment like toggled successfully")
        )
    }

    const commentLike= await Like.create({
        comment:commentId,
        likedBy:req.user?._id
    })

    if(!commentLike){
        throw new ApiError(400,"Error while creating a comment like")
    }

    res.status(200).json(
        new ApiResponse(200,commentLike,"comment like toggled successfully")
    )
})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    if(!tweetId){
        throw new ApiError(400,"TweetId is a required field")
    }

    const validateTweet=mongoose.Types.ObjectId(tweetId)

    const tweet=await Like.findOne({
        tweet:validateTweet,
        likedBy:req.user?._id
    })

    if(tweet){
        await tweet.deleteOne()
        return res.status(200).json(
            new ApiResponse(200,{},"Tweet toggled successfully")
        )
    }

    const newTweet=await Like.create({
        tweet:validateTweet,
        likedBy:req.user?._id
    })

    if(!newTweet){
        throw new ApiError(400,"Error while creating new Tweet")
    }
    res.status(200).json(
        new ApiResponse(200,newTweet,"Tweet like toggled successfully")
    )
})

const getLikedVideos=asyncHandler(async(req,res)=>{
    const videos=await Like.find({
        likedBy:req.user?._id
    })

    const getVideos=videos.map(sub=>sub.video)
    if(getVideos.length===0){
        throw new ApiError(400,"Error while getting liked videos")
    }

    res.status(200).json(
        new ApiResponse(200,getVideos,"Liked videos fetched successfully")
    )
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}