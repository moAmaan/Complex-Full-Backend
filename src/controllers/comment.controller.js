import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  let pipeline = [
    {
      $match: { video: new mongoose.Types.ObjectId(videoId) },
    },
  ];

  let options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const comments = await Comment.aggregatePaginate(pipeline, options);
  if (!comments) {
    throw new ApiResponse(400, "comments not found");
  }
  res.status(200).json(new ApiResponse(200, comments, "All comments fetched"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Cannot add comment to this video");
  }

  const data = Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  res.status(200).json(new ApiResponse(200, data, "Comment added to video"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }
  const comment = await Comment.findById(commentId);
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "User is authorized to update the comment");
  }
  const updatedComment = Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new ApiError(400, "connot find comment");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, updateComment, "Updated comment successfully !")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id");
  }
  await Comment.findByIdAndDelete({ _id: commentId });
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted succesfully !"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
