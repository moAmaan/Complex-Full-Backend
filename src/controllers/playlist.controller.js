import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400,"Invalid name or description")
    }
    if(!req.user?._id){
        throw new ApiError(400,"user not authrized")
    }
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(400,"User is not authorized");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : new mongoose.Types.ObjectId(req.user?._id)
    })

    if(!playlist){
        throw new ApiError(400,"error while creating a playlist !")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist created successfuly.")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Inavlid user id")
    }
    const getPlaylist = await Playlist.find({
        owner : userId
    })

    if(!getPlaylist){
        throw new ApiError(400,"Couldn't find the playlist, check the userId")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,getPlaylist,"Success in fetching the playlist !")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id provided")
    }
    const playlistById = await Playlist.findById(playlistId)
    if(!playlistById){
        throw new ApiError(400,"error in fetching the plalist by id")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlistById,"playlist found by id")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(videoId) && !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id or video id")
    }
    // check the user authorization.
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"cannot find the playlist with the given playlist Id")
    }
    if(playlist.owner!=req.user?._id){
        throw new ApiError(400,"User not authorized to add video to playlist")
    }

    //check if video already exists

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"video already exists in playlist, cannot update in given playlist")
    }

    //add the video 

    playlist.videos.push(videoId)

    const videoAdded = await playlist.save()

    if(!videoAdded){
        throw new ApiError(400,"Error in adding the video to given plalist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoAdded,"Success in adding the video to given playlist")
    )



})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) && !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist id or video Id")
    }
    const findPlaylist = await Playlist.findOne(
        {
            $and : [
                {
                    _id : playlistId,
                    videos : videoId
                }
            ]
        }
    )
    if(!findPlaylist){
        throw new ApiError(400,"error in finding the playlist")
    }
    if(!findPlaylist.owner.equals(req.user?._id)){
        throw new ApiError(400, "User not authorized to remove video")
    }

    findPlaylist.videos.pull(videoId)
    const videoremoved = await findPlaylist.save();
    if(!videoremoved){
        throw new ApiError($00,"Please try again to remove video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoremoved,"Video rmeoved from playlist")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(40,"User not authorized to delete the video")
    }
    const deletedVideo = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedVideo){
        throw new ApiError(400,"error is deleting the video try again")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,deletedVideo,"Video deleted success")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(400,"User not authorized to update the video content")
    } 
    playlist.name = name
    playlist.description = description
    const updatedPlaylist = await playlist.save()
    if(!updatedPlaylist){
        throw new ApiError(400,"Error while updating the conten of video")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"Video content updated success !")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}