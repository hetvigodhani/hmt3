import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Patient } from "../models/patient.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import logger from "../logger/index.js";
import jwt from "jsonwebtoken";
import { options } from "../constants.js";

const test = asyncHandler(async (req, res) => {
    try {
        logger.info("test", req.body);
        if (req) {
            throw new ApiError(400, "Test Failed: just for trying");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { details: "just for trying" },
                    "Test Route"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "Test Route: " + error.message,
                    "Test Route"
                )
            );
    }
});

const registerPatient = asyncHandler(async (req, res) => {
    try {
        logger.info("registerPatient", req.body);
        const {
            username,
            password,
            bloodgroup,
            firstName,
            lastname,
            dateOfBirth,
            email,
            phoneNumber,
            alternatePhoneNumber,
            emergencyContactName,
            aadharCard,
            panCard,
            gender,
            address,
            profilePicture,
            chronicConditions,
            pastSurgeries,
            allergies,
            medications,
            insuranceProvider,
            policyNumber,
            coverageDetails,
            primaryCarePhysician,
            physicianContactInfo,
            nurseNotes,
            labResults,
        } = req.body;
        if (
            [
                username,
                password,
                bloodgroup,
                firstName,
                lastname,
                dateOfBirth,
                email,
                phoneNumber,
                alternatePhoneNumber,
                emergencyContactName,
                emergencyContactPhoneNumber,
                aadharCard,
                panCard,
                gender,
                address.street,
                address.city,
                address.state,
                address.zip,
                address.country,
            ].some((field) => typeof field !== "string" || field.trim() === "")
        ) {
            throw new ApiError(400, "Invalid Patient Data");
        }
        const existingUser = await User.findOne({
            $or: [
                // { username: username.toLowerCase() },
                { email: email },
                { phoneNumber: phoneNumber },
            ],
        });
        if (existingUser) {
            throw new ApiError(400, "Patient Already Exists");
        }
        // upload to cloud storage here
        const localFilePath = req.file.path;

        const patient = await Patient.create({
            username: username.toLowerCase(),
            password,
            bloodgroup,
            firstName,
            lastname,
            dateOfBirth: new Date(dateOfBirth),
            email,
            phoneNumber,
            alternatePhoneNumber,
            emergencyContactName,
            aadharCard,
            panCard,
            gender,
            address,
            profilePicture: localFilePath,
            chronicConditions,
            pastSurgeries,
            allergies,
            medications,
            insuranceProvider,
            policyNumber,
            coverageDetails,
            primaryCarePhysician,
            physicianContactInfo,
            nurseNotes,
            labResults,
        });

        const createdPatient = await Patient.findById(patient._id).select(
            "-password -refreshToken"
        );
        if (!createdPatient)
            throw new ApiError(
                500,
                "Something went wrong while registering Patient"
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    createdPatient,
                    "Patient Registered Successfully"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "Patient Registration Failed: " + error.message
                )
            );
    }
});

const loginPatient = asyncHandler(async (req, res) => {
    try {
        logger.info("loginPatient", req.body);

        const { email, phoneNumber, password } = req.body;
        if (!email && !phoneNumber) {
            throw new ApiError(400, "Email or Phone Number is Required");
        }

        // Check if both email and phoneNumber are provided
        if (email && phoneNumber) {
            throw new ApiError(
                400,
                "Provide either Email or Phone Number, not both"
            );
        }
        if (
            (email && !email.trim()) ||
            (phoneNumber && !phoneNumber.trim()) ||
            !password.trim()
        ) {
            throw new ApiError(400, "All Fields are Required");
        }

        const existingPatient = await Patient.findOne({
            $or: [
                // { username: username.toLowerCase() },
                { email: email },
                { phoneNumber: phoneNumber },
            ],
        });

        if (!existingPatient) {
            throw new ApiError(400, "Patient Not Found");
        }

        const correctPassword =
            await existingPatient.isPasswordCorrect(password);
        if (!correctPassword) {
            throw new ApiError(400, "Invalid Password");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(existingUser._id);

        const loggedInPatient = await Patient.findById(
            existingPatient._id
        ).select("-password -refreshToken");

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        patient: loggedInPatient,
                        refreshToken: refreshToken,
                        accessToken: accessToken,
                    },
                    "Current Patient Details"
                )
            );
    } catch (error) {
        // logger.error(error.message, error);
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Patient Login Failed: " + error.message)
            );
    }
});

const logoutPatient = asyncHandler(async (req, res) => {
    try {
        logger.info("logoutPatient", req.body);
        await Patient.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1, // this removes the field from document
                },
            },
            {
                new: true,
            }
        );

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "Patient logged Out"));
    } catch (error) {
        // logger.error(error.message, error);
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Patient Logout Failed" + error.message)
            );
    }
});

const generateAccessAndRefreshToken = async (user_id) => {
    try {
        logger.info("generateAccessAndRefreshToken", user_id);
        const patient = await Patient.findById(patient_id);
        if (!patient) {
            throw new ApiError(404, "Patient Not Found");
        }
        const accessToken = patient.generateAccessToken();
        const refreshToken = patient.generateRefreshToken();
        patient.refreshToken = refreshToken;
        await patient.save();
        console.log({ accessToken, refreshToken });
        return { accessToken, refreshToken };
    } catch (error) {
        // logger.error(error.message, error);
        //return error;
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "Token Generation Failed: " + error.message
                )
            );
    }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        logger.info("refreshAccessToken", req.body);
        const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decoded = jwt.verify(
            incomingToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const patient = await Patient.findById(decoded?.id);
        if (!user) {
            throw new ApiError(404, "Invalid Refresh Token");
        }
        if (user.refreshToken !== incomingToken) {
            throw new ApiError(401, "Access Token expired or used");
        }
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Token Refreshed Successfully"
                )
            );
    } catch (error) {
        // logger.error(error.message, error);
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Token Refresh Failed: " + error.message)
            );
    }
});

export {
    test,
    registerPatient,
    loginPatient,
    logoutPatient,
    refreshAccessToken,
};
