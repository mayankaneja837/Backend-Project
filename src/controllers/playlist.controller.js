import mongoose,{isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const createPlaylist=asyncHandler(async (req,res)=>{
    const {name,description}=req.body

    if(!name || !description){
        throw new ApiError(401,"name and description of the playlist is required")
    }
   
    const playlist = await Playlist.create({
        name:name,
        description:description,
    })

    if(!playlist){
        throw new ApiError(401,"Something went wrong while creating a playlist")
    }

    res.status(201).json(
        new ApiResponse(201,playlist,"Playlist created successfully")
    )
})

const userPlaylist=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    if(!userId){
        throw new ApiError(401,"User id does not exist")
    }

    const playlist=await Playlist.find({owner:userId})
    if(!playlist){
        throw new ApiError(401,"Playlist doesnt exist with the given UserId")
    }

    res.status(201).json(
        new ApiResponse(201,playlist.videos,"User playlist fetched successfully")
    )
})

const getplaylistId=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    if(!playlistId){
        throw new ApiError(401,"Playlist Id doesn't exist")
    }

    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist with that given Id does not exist")
    }

    res.status(200).json(
        new ApiResponse(200,playlist.videos,"Playlist with the given Id fetched successfully")
    )
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    const {videoIds}=req.body

    if(!playlistId || !videoIds){
        throw new ApiError(401,"Either of playlistId or VideoId or both of them doesn' exist")
    }

    const normalizedVideo=Array.isArray(videoIds) ? videoIds:[videoIds]
    const playlist=await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos:{
                $each:normalizedVideo
            }
        },
        $set:{
            owner:req.user?._id
        }
    },{
        new:true
    })

    if(!playlist){
        throw new ApiError(400,"Error while uploading video to a playlist")
    }

    res.status(201).json(
        new ApiResponse(201,playlist.videos,"Video added to the playlist successfully")
    )
})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params
    if(!playlistId || !videoId){
        throw new ApiError(401,"PlaylistId or VideoID is missing")
    }

    const playlist=await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos:videoId
        }
    },{
        new:true
    }).select("-owner")

    if(!playlist){
        throw new ApiError(401,"Error while removing the video")
    }

    res.status(200).json(
        new ApiResponse(200,playlist,"Video removed from the playlist successfully")
    )
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    if(!playlistId){
        throw new ApiError(401,"PlaylistId field is empty")
    }
    await Playlist.findByIdAndDelete(playlistId)

    res.status(200).json(
        new ApiResponse(200,{},"Playlist deleted successfully")
    )
})
export {
    createPlaylist,
    userPlaylist,
    getplaylistId,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist
}