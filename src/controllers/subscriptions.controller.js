import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import mongoose,{isValidObjectId} from "mongoose"
import {Subscription} from "../models/subscriptions.model.js"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params
    if(!channelId){
        throw new ApiError(400,"ChannelId not found")
    }

    const userId=mongoose.Types.ObjectId(req.user._id)
    const ObjectchannelId=mongoose.Types.ObjectId(channelId)

    const subscriptions=await Subscription.findOne({
        subscriber:userId,
        channel:ObjectchannelId
    })

    if(subscriptions){
        await subscriptions.deleteOne()
        return res.status(200).json(
            new ApiResponse(200,{},"User toggled successfully")
        )
    }

    const newUser=await Subscription.create({
        subscriber:req.user._id,
        channel:ObjectchannelId
    })

    if(!newUser){
        throw new ApiError(400,"Error while creating a new document")
    }

    res.status(200).json(
        new ApiResponse(200,newUser,"User's status toggled successfully")
    )

})

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params
    if(!channelId){
        throw new ApiError(400,"ChannelId not found")
    }

    const validChannelId=isValidObjectId(channelId)
    if(!validChannelId){
        throw new ApiError(400,"ChannelId obtained is not valid")
    }

    const ObjectchannelId=mongoose.Types.ObjectId(channelId)
    const result=await Subscription.aggregate([
        {
            $match:{
                channel:ObjectchannelId
            }
        },
        {
            $count:"subscriberCount"
        }
    ])

    const subscriberCount=result[0]?.subscriberCount || 0

    res.status(200).json(
        new ApiResponse(200,subscriberCount,"Subscriber Count fetched successfully")
    )
})

const getSubscribedChannels=asyncHandler(async(req,res)=>{
    const {subscriberId}=req.params
    if(!subscriberId){
        throw new ApiError(401,"SubscriberId is missing")
    }

    const validateId=isValidObjectId(subscriberId)
    if(!validateId){
        throw new ApiError(400,"SubscriberId is not valid")
    }

    const Subscriber=await Subscription.find({subscriber:mongoose.Types.ObjectId(subscriberId)})
    if(Subscriber.length===0){
        throw new ApiError(400,"Either the subscriber doesnt exist or it has zero subscriptions")
    }

    const channels=Subscriber.map(sub=>sub.channel)
    
    res.status(200).json(
        new ApiResponse(200,channels,"Subscribed channels fetched successfully")
    )
})
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}