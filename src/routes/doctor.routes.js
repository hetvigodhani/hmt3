import {
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    updateDoctor,
    refreshAccessToken,
    getDoctorBy,
    getAllDoctors,
} from "../controllers/doctor.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin, verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// public
router.route("/register").post(upload.single("profilePicture"), registerDoctor);
router.route("/login").post(loginDoctor);
// private
router.route("/logout").post(verifyJwt, logoutDoctor);
router.route("/update/:id").put(verifyJwt, updateDoctor);
router.route("/refresh-token").post(verifyJwt, refreshAccessToken);
router.route("/id/:id").get(verifyJwt, getDoctorBy);
router.route("/phoneNumber/:phoneNumber").get(verifyJwt, getDoctorBy);
router.route("/email/:email").get(verifyJwt, getDoctorBy);
router.route("/username/:username").get(verifyJwt, getDoctorBy);
// admin only
router.route("/doctors").get(verifyJwt, verifyAdmin, getAllDoctors);

export default router;
