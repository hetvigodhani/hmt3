import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
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
const registerUser = asyncHandler(async (req, res) => {
    try {
        logger.info("registerUser", req.body);
        const {
            username,
            password,
            role,
            fullName,
            email,
            phoneNumber,
            dateOfBirth,
            gender,
            address,
        } = req.body;
        if (
            [
                username,
                password,
                role,
                fullName,
                email,
                phoneNumber,
                dateOfBirth,
                gender,
                address.street,
                address.city,
                address.state,
                address.zip,
                address.country,
            ].some((field) => typeof field !== "string" || field.trim() === "")
        ) {
            throw new ApiError(400, "Invalid User Data");
        }
        const existingUser = await User.findOne({
            $or: [
                // { username: username.toLowerCase() },
                { email: email },
                { phoneNumber: phoneNumber },
            ],
        });
        if (existingUser) {
            throw new ApiError(400, "User Already Exists");
        }
        // upload to cloud storage here
        const localFilePath = req.file.path;

        const user = await User.create({
            username: username.toLowerCase(),
            password,
            role,
            fullName,
            email,
            phoneNumber,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            address,
            profilePicture: localFilePath,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
        if (!createdUser)
            throw new ApiError(
                500,
                "Something went wrong while registering User"
            );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    createdUser,
                    "User Registered Successfully"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "User Registration Failed: " + error.message
                )
            );
    }
});

const loginUser = asyncHandler(async (req, res) => {
    try {
        logger.info("loginUser", req.body);

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

        const existingUser = await User.findOne({
            $or: [
                // { username: username.toLowerCase() },
                { email: email },
                { phoneNumber: phoneNumber },
            ],
        });

        if (!existingUser) {
            throw new ApiError(400, "User Not Found");
        }

        const correctPassword = await existingUser.isPasswordCorrect(password);
        if (!correctPassword) {
            throw new ApiError(400, "Invalid Password");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(existingUser._id);

        const loggedInUser = await User.findById(existingUser._id).select(
            "-password -refreshToken"
        );

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        refreshToken: refreshToken,
                        accessToken: accessToken,
                    },
                    "Current User Details"
                )
            );
    } catch (error) {
        // logger.error(error.message, error);
        return res
            .status(400)
            .json(new ApiResponse(400, "User Login Failed: " + error.message));
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        logger.info("logoutUser", req.body);
        await User.findByIdAndUpdate(
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
            .json(new ApiResponse(200, {}, "User logged Out"));
    } catch (error) {
        // logger.error(error.message, error);
        return res
            .status(400)
            .json(new ApiResponse(400, "User Logout Failed" + error.message));
    }
});
const generateAccessAndRefreshToken = async (user_id) => {
    try {
        logger.info("generateAccessAndRefreshToken", user_id);
        const user = await User.findById(user_id);
        if (!user) {
            throw new ApiError(404, "User Not Found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();
        console.log({ accessToken, refreshToken });
        return { accessToken, refreshToken };
    } catch (error) {
        // logger.error(error.message, error);
        return error;
        // response returning is not required (used in same controller as a function only )
        //     return res
        //         .status(400)
        //         .json(
        //             new ApiResponse(
        //                 400,
        //                 "Token Generation Failed: " + error.message
        //             )
        //         );
    }
};
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        logger.info("gerAllUsers", req.body);
        const users = await User.find().select("-password -refreshToken");
        return res
            .status(200)
            .json(new ApiResponse(200, users, "All Users Details"));
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "All Users Details Fetching Failed" + error.message
                )
            );
    }
});

const getUserBy = asyncHandler(async (req, res) => {
    try {
        logger.info("getUserBy", req.body);

        if (req.params.id) {
            const user = await User.findById(req.params.id).select(
                "-password -refreshToken"
            );
            if (!user) {
                throw new ApiError(404, "User Not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, user, "User Details"));
        } else if (req.params.email) {
            const user = await User.findOne({ email: req.params.email }).select(
                "-password -refreshToken"
            );
            if (!user) {
                throw new ApiError(404, "User Not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, user, "User Details"));
        } else if (req.params.phoneNumber) {
            const user = await User.findOne({
                phoneNumber: req.params.phoneNumber,
            }).select("-password -refreshToken");
            if (!user) {
                throw new ApiError(404, "User Not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, user, "User Details"));
        } else if (req.params.role) {
            const users = await User.find({ role: req.params.role }).select(
                "-password -refreshToken"
            );
            if (!users) {
                throw new ApiError(404, "User Not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, users, "User Details"));
        } else {
            throw new ApiError(400, "Invalid Request");
        }
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "User Details Fetching Failed" + error.message
                )
            );
    }
});

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
        const user = await User.findById(decoded?.id);
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
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getAllUsers,
    getUserBy,
};
