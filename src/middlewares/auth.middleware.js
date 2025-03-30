import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("authorization")?.replace("Bearer","")
        if(!token){
            throw new ApiError(401,"Token doesnt exist")
        }
    
        const verify = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        console.log(verify)
    
        const user=await User.findById(verify?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid middleware operation")
    }
})