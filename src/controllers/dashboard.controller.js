import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(401,"Invaid channel id")
    }

    const videos = Video.countDocuments({
        owner : req.user?._id
    })
    const subscribers = Subscription.countDocuments({
        channel : req.user?._id
    })

    if(!subscribers){
        throw new ApiError(404,"subscribers not found");
    }
    if(!videos){
        throw new ApiError(404,"videos not found");
    }

    const likesAndViews = Video.aggregate([
        {
            $match : {
                owner : req.user?._id
            }
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "video",
                as : "liked"
            }
        },
        {
            $addFields : {
                likes : {
                    $size : "$liked"
                },
                owner : req.user.username
            }
        },
        {
            $group : {
                _id : null,
                likeCount : {
                    $sum : "$likes"
                },
                viewCount : {
                    $sum : "$views"
                }
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,subscribers,likesAndViews,"All information fetched for the channel")
    )


})

const getChannelVideos = asyncHandler(async (req, res) => {

    const videos = await Video.countDocuments({
        owner : req.user?._id
    })

    if(!videos){
        throw new ApiError(404,"No videos found for the channel")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"All videos fetched for the channel")
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }