import { Router } from "express";
import {
    test,
    registerUser,
    loginUser,
    logoutUser,
    getUserBy,
    getAllUsers,
    refreshAccessToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin, verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/test").get(test);
//public routes
router.route("/register").post(upload.single("profilePicture"), registerUser);
router.route("/login").post(loginUser);

router.route("/id/:id").get(getUserBy);
router.route("/email/:email").get(getUserBy);
router.route("/phone/:phoneNumber").get(getUserBy);
router.route("/role/:role").get(getUserBy);

// private routes
router.route("/users").get(verifyJwt, verifyAdmin, getAllUsers);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);

export default router;
