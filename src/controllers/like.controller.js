import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id")
    }
    const Liked = await Like.findOne({
        likeBy : req.user?._id,
        video : videoId
    })
    if(Liked){
        await Like.findByIdAndDelete(Liked._id)
        return res
        .status(200)
        .json(new ApiResponse(200,Liked,"Unliked the video"))
    }
    const videoLiked = Like.create(
        {
            likeBy : req.user?._id,
            video : videoId
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,videoLiked,"Video Liked success !")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }
    const commentLiked = await Like.findOne({
        likeBy : req.user?._id,
        comment : commentId
    })
    if(commentLiked){
        await Like.findByIdAndDelete(commentLiked._id)
        return res
        .status(200)
        .json(new ApiResponse(200,commentLiked,"Unliked the comment"))
    }
    const likeComment = Like.create(
        {
            likeBy : req.user?._id,
            comment : commentId
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,likeComment,"comment Liked success !")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }
    const likedTweet = await Like.findOne({
        likeBy : req.user?._id,
        tweet : tweetId
    })
    if(likedTweet){
        await Like.findByIdAndDelete(likedTweet._id)
        return res
        .status(200)
        .json(new ApiResponse(200,likedTweet,"Unliked the video"))
    }
    const tweetLiked = Like.create(
        {
            likeBy : req.user?._id,
            tweet : tweetId
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweetLiked,"Video Liked success !")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const allLikedVideo = Like.find({
        likeBy : req.user?._id,
        video : {$exists : true}
    })
    if(!allLikedVideo){
        throw new ApiError(400,"liked videos not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,allLikedVideo,"All liked video fetched !!")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}