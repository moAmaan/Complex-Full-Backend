import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User not authorized !");
  }
  let pipeline = [
    {
      $match: {
        $and: [
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
            ],
          },
          {
            owner: new mongoose.Types.ObjectId(userId),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "Owner",
        pipeline: [
          {
            project: {
              _id: 1,
              fullname: 1,
              avatar: "$avatar.url",
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        Owner: {
          $first: "$Owner",
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortType,
      },
    },
  ];
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  try {
    const result = await Video.aggregatePaginate(
      Video.aggregate(pipeline),
      options
    );
    if (result.videos.length == 0) {
      res.status(400).json(new ApiResponse(400, {}, "No videos found"));
    }
    res
      .status(200)
      .json(new ApiResponse(200, result, "All videos fetched success!"));
  } catch (error) {
    console.log("Error is fetching videos", error);
    res
      .status(500)
      .json(new ApiError(500, "Internal error while fetching videos"));
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    if ([title, description].some((item) => item.trim() == "")) {
      throw new ApiError(400, "provide title ans description please !");
    }
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbNailLocalPath = req.files?.thumbNail[0]?.path;
    if (!videoLocalPath && !thumbNailLocalPath) {
      throw new ApiError(400, "Video and thumbnail is required");
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbNail = await uploadOnCloudinary(thumbNailLocalPath);
    if (!videoFile && !thumbNail) {
      throw new ApiError(400, "Video and thumbnail is required");
    }
    const video = await Video.create({
      videoFile: videoFile?.url,
      thumbnail: thumbNail?.url,
      title,
      description,
      duration: videoFile?.duration,
      isPublished: true,
      owner: req.user?._id,
    });
    if (!video) {
      throw new ApiError(400, "Error ocurred while uploading the video");
    }
    res
      .status(200)
      .json(new ApiResponse(200, video, "Video uploaded success !"));
  } catch (error) {
    throw new ApiError(500, "Internal server error", error);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (isValidObjectId(videoId)) {
    throw new ApiError(400, "Video not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  res.status(200).json(new ApiResponse(200, video, "Video found success !"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  if ([title, description].some((item) => item.trim() == "")) {
    throw new ApiError(400, "provide valid title and description !");
  }
  if (isValidObjectId(videoId)) {
    throw new ApiError(400, "video not found");
  }
  const thumbNail = req.file?.path;
  if (!thumbNail) {
    throw new ApiError(400, "Thumbnail not found");
  }
  const thumbNailLocalPath = await uploadOnCloudinary(thumbNail);
  if (!thumbNailLocalPath.url) {
    throw new ApiError(400, "Thumbnail not uploaded error !");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbNailLocalPath.url,
      },
    },
    {
      new: true,
    }
  );
  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated success"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  if (video.owner !== req.user?._id) {
    throw new ApiError(40, "User not authorized");
  }
  const videoFile = await deleteFromCloudinary(video.videoFile);
  const thumbNail = await deleteFromCloudinary(video.thumbnail);

  if (!videoFile && !thumbNail) {
    throw new ApiError(400, "Connot deleted files from cloudinary");
  }
  await video.remove();
  res.status(200).json(new ApiResponse(200, {}, "Video deleted success !"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (isValidObjectId(!videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findOne(
    { 
        id : videoId,
        owner : req.user?._id 
    }
);
  if (!video) {
    throw new ApiError(400, "connot find valid video id");
  }
  video.isPublished = !video.isPublished
  await video.save()
  res
  .status(200)
  .json(
    new ApiResponse(200,video,"Video toggles success !")
  )
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
