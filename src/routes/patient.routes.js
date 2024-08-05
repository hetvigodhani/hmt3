import { Router } from "express";
import {
    test,
    registerPatient,
    loginPatient,
    logoutPatient,
} from "../controllers/patient.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyPatient, verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();


router.route("/test").get(test);
//public routes
router.route("/register").post(upload.single("profilePicture"), registerPatient);
router.route("/login").post(loginPatient);


// private routes
router.route("/logout").post(verifyJwt, logoutPatient);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);

export default router;
