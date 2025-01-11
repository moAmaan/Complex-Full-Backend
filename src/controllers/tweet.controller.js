import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const content = req.body
    const tweet = await Tweet.create({
        content,
        owner : req.user?._d
    })

    if(!tweet){
        throw new ApiError(400,"Invalid tweet")
    }
    res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet added succesfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user")
    }
    const tweets = await Tweet.find({
        owner : new mongoose.Types.ObjectId(userId)
    })
    if(!tweets){
        throw new ApiError(400,"No tweets found")
    }
    res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"All tweets found !!")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    const {content} = req.body
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user")
    }

    if(!content){
        throw new ApiError(400,"please provide valid comment !")
    }

    const tweet = Tweet.findOne({
        $and : [{owner : new mongoose.Types.ObjectId(req.user?._id)},{_id : tweetId}]
    })

    if(!tweet){
        throw new ApiError(400,"user not authorized")
    }

    
    tweet.content = content;
    const updatedTweet = await tweet.save();
    if(!updateTweet){
        throw new ApiError(400,"error in updating the tweet")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,updateTweet,"Tweet updated success !")
    )


})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet")
    }
    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deleteTweet){
        throw new ApiError(400,"error is deleting the tweet")
    }
    res
    .status(200)
    .json(
        new ApiResponse(200,deleteTweet,"Tweet deleted success !")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}