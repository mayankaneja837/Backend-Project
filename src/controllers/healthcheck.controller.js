import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { uptime } from "process"

const healthCheck=asyncHandler(async(req,res)=>{

    res.status(200).json(
        new ApiResponse(200,{
            uptime:process.uptime
        },"App is working correctly")
    )
})

export {
    healthCheck
}