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

export {
    createPlaylist
}