import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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

// secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/get-user").post(verifyJWT, getCurrentUser);
router.route("/update-avatar").post(
  upload.single({
    name: "avatar",
    maxCount: 1,
  }),
  verifyJWT,
  updateAvatar
);
router.route("/update-coverImage").post(
  upload.single({
    name: "coverImage",
    maxCount: 1,
  }),
  verifyJWT,
  updateUserCoverImage
);

export default router;
