import {ApiRespons, ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js"


const publishAVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body

    if((!(title  || !description))){
        throw new ApiError(401,"Title and description are required")
    }

    const videoLocalPath=req.files?.videoFile[0]?.path
    if(!videoLocalPath){
        throw new ApiError(401,"Video file doesnt exist")
    }

    const thumbnailPath=req.files?.thumbnail[0]?.path
    if(!thumbnailPath){
        throw new ApiError(401,"Thumbnail is a required field")
    }

    const videoPath=await uploadonCloudinary(videoLocalPath)
    const thumbnail=await uploadonCloudinary(thumbnailPath)

    if(!videoPath.url){
        throw new ApiError(404,"Error while uploading on cloudinary")
    }

    if(!thumbnail.url){
        throw new ApiError(404,"Error while uploading on cloudinary")
    }

    const video = await Video.create({
        title,
        description,
        videoFile:videoPath.url,
        thumbnail:thumbnail.url,
        owner:req.user?._id,
    })

    console.log(video)
    if(!video){
        throw new ApiError(401,"There was something wrong while creating the model")
    }

    res.status(200)
    .json(
        new ApiResponse(200,video,"Published a video successfully")
    )
})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    if(!videoId){
        throw new ApiError(401,"Video Id doesnt exist")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(401,"The video doesnt exist")
    }

    res.status(200).json(
        new ApiResponse(200,video,"Video with that id fetched")
    )

})

const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    const {title,description}=req.body

    if(!videoId){
        throw new ApiError(404,"VideoId doesnt exist")
    }

    if(!title || !description){
        throw new ApiError(404,"Either of title or description or both are missing")
    }

    const thumbnailPath=req.files?.thumbnail[0]?.path
    if(!thumbnailPath){
        throw new ApiError(404,"Error while accessing the localpath of thumbnail")
    }

    const thumbnail=await uploadonCloudinary(thumbnailPath)

    const updatedChanges=await Video.findByIdAndUpdate(videoId,
        {
            title:title,
            description:description,
            thumbnail:thumbnail,
        },{
            new:true
        }
    ).select("-owner -videoFile")

    if(!updatedChanges){
        throw new ApiError(404,"Error while updating the video model")
    }

    res.status(201)
    .json(
        new ApiResponse(201,updatedChanges,"Video model updated successfully")
    )
})


export {
publishAVideo, 
getVideoById,
updateVideo
}