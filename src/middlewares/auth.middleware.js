import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import logger from "../logger/index.js";
import { roleEnum } from "../constants.js";
import { Doctor } from "../models/doctor.model.js";
import { Patient } from "../models/patient.model.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        logger.info("verifyJwt");
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized Request");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (
            decodedToken?.role === roleEnum.ADMIN ||
            decodedToken?.role === roleEnum.SUPER_ADMIN ||
            decodedToken?.role === roleEnum.STAFF
        ) {
            const user = await User.findById(decodedToken?.id).select(
                "-password -refreshToken"
            );
            if (!user) {
                throw new ApiError(401, "Invalid Access Token");
            }
            req.user = user;
        } else if (decodedToken?.role === roleEnum.DOCTOR) {
            const user = await Doctor.findById(decodedToken?.id).select(
                "-password -refreshToken"
            );
            if (!user) {
                throw new ApiError(401, "Invalid Access Token");
            }
            req.user = user;
        } else if (decodedToken?.role === roleEnum.PATIENT) {
            const user = await Patient.findById(decodedToken?.id).select(
                "-password -refreshToken"
            );
            if (!user) {
                throw new ApiError(401, "Invalid Access Token");
            }
            req.user = user;
        } else{
            throw new ApiError(401, "Invalid Access Token");
        }
        next();
    } catch (error) {
        // logger.error(error.message, error)
        return res
            .status(400)
            .json(new ApiResponse(401, "Unauthorized Request" + error.message));
    }
});

const verifyAdmin = asyncHandler(async (req, res, next) => {
    try {
        logger.info("verifyAdmin");
        const isAdmin = req.user.role === "admin";
        if (!isAdmin) {
            throw new ApiError(
                401,
                "Unauthorized Request, Admin Access Required"
            );
        }
        next();
    } catch (error) {
        // logger.error(error.message, error)
        throw new ApiError(
            401,
            "Unauthorized Request, Admin Access Required: ",
            error.message
        );
    }
});

export { verifyJwt, verifyAdmin };
