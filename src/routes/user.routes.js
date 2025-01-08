import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCurrentUser,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/video-comments").get(getVideoComments);
router.route("/update-comment").post(updateComment);
router.route("/delete-comment").post(deleteComment);

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/get-user").post(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateCurrentUser);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/update-coverImage")
  .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/user-watchHisory").get(verifyJWT, getWatchHistory);
router.route("/add-comment").post(verifyJWT,addComment);
export default router;
