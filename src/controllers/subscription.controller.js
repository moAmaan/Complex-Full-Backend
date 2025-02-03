import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    const channelExists = await User.findById(channelId)
    if(!channelExists){
        throw new ApiError(400,"No channel exists with this channel id")
    }

    const ifExists = await Subscription.findOne(
        {
            subscriber : req.user?._id,
            channel : channelId
        }
    )

    if(!ifExists){
        try {
            const subscription = await Subscription.create({
                subscriber : req.user?._id,
                channel : channelId
            })
            return res
            .status(200)
            .json(
                new ApiResponse(200,subscription,"added a subscriber !")
            )
        } catch (error) {
            throw new ApiError(400,error)
        }
    }
    else{
        try {
            const subscribed = await Subscription.findByIdAndDelete(ifExists._id)
            return res
            .status(200)
            .json(
                new ApiResponse(200,subscribed,"Subscription removed")
            )
        } catch (error) {
            throw new ApiError(400,error)
        }
    }



})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"Channel not found with given Id")
    }
    const subscriber = await Subscription.aggregate([
        {
            $match : {
                channel : channelId
            }
        },
        {

            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriber"
            }
        },
        {

            $unwind : "$subscriber"
        },
        {

            $project : {
                subscriber : {
                    _id : 1,
                    fullname : 1,
                    username : 1,
                    avatar : 1
                }
            }
        }
    ])

    if(!subscriber.length){
        throw new ApiError(400,"No suscriber found for this channel")
    }
    const details = {
        subscriber : subscriber || [],
        subscriberLength : subscriber.length
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,details,"Found all the suscribers for this channel")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber id")
    }
    const subscriberExists = await User.findById(subscriberId)
    if(!subscriberExists){
        throw new ApiError(400,"This subscriber doesn't exists for given id")
    }

    const channels = Subscription.aggregate([
        {
            $match : {
                subscriber : subscriberId
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channel"
            }
        },
        {
            $unwind : "$channel"
        },
        {
            $project : {
                subscriber : {
                    _id : 1,
                    fullname : 1,
                    username : 1,
                    avatar : 1
                }
            }
        }
    ])

    if(!channels.length){
        throw new ApiError(400,"No channels found subscribed by user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channels,"All channels subscribed by users fetched")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}