import mongoose from "mongoose"

const commentSchema=new mongoose.Schema({
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    },

},{timestamps:true})

export const Comment=mongoose.model("Comment",commentSchema)