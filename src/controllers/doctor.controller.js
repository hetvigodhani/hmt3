import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Doctor } from "../models/doctor.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import logger from "../logger/index.js";
import jwt from "jsonwebtoken";
import { roleEnum, options } from "../constants.js";

const registerDoctor = asyncHandler(async (req, res) => {
    try {
        const {
            username,
            password,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            address,
            qualification,
            specialization,
            hospitalAffiliation,
            licenseNumber,
            yearsOfExperience, // Add yearsOfExperience here
            primaryClinicAddress, // Add primaryClinicAddress here
            clinicPhoneNumber, // Add clinicPhoneNumber here
            clinicEmail, // Add clinicEmail here
        } = req.body;

        if (
            [
                username,
                password,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                phoneNumber,
                email,
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country,
                qualification,
                specialization,
                hospitalAffiliation,
                licenseNumber,
            ].some((field) => !field || field === "")
        ) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await Doctor.findOne({
            $and: [{ phoneNumber: phoneNumber }, { email: email }],
        });

        if (existingUser) {
            throw new ApiError(400, "User already exists");
        }
        const localFilePath = req.file.path || "";
        if (!localFilePath) {
            throw new ApiError(400, "Profile picture is required");
        }

        const doctor = await Doctor.create({
            username: username.toLowerCase(),
            password,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            address,
            qualification,
            specialization,
            hospitalAffiliation,
            licenseNumber,
            profilePicture: localFilePath,
            role: roleEnum.DOCTOR,
            ...(yearsOfExperience && {
                yearsOfExperience: req.body.yearsOfExperience,
            }),
            ...(primaryClinicAddress && {
                primaryClinicAddress: req.body.primaryClinicAddress,
            }),
            ...(clinicPhoneNumber && {
                clinicPhoneNumber: req.body.clinicPhoneNumber,
            }),
            ...((clinicEmail && { clinicEmail: req.body.clinicEmail }) || ""),
        });

        const createdDoctor = Doctor.findById(doctor._id).select(
            "-password -refreshToken -isInactive"
        );
        if (!createdDoctor) {
            throw new ApiError(500, "Doctor not created");
        }
        const responseData = {
            _id: createdDoctor._id,
            username: createdDoctor.username,
            firstName: createdDoctor.firstName,
            lastName: createdDoctor.lastName,
            email: createdDoctor.email,
            // Add other necessary fields here
        };
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    responseData,
                    "Doctor created successfully"
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(
                new ApiResponse(500, error.message, "Register Doctor failed")
            );
    }
});

const loginDoctor = asyncHandler(async (req, res) => {
    try {
        logger.info("Login Doctor");
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

        const existingDoctor = await Doctor.findOne({
            $or: [{ email: email }, { phoneNumber: phoneNumber }],
        });

        if (!existingDoctor) {
            throw new ApiError(400, "User Not Found");
        }

        const correctPassword =
            await existingDoctor.isPasswordCorrect(password);
        if (!correctPassword) {
            throw new ApiError(400, "Invalid Password");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(existingDoctor._id);

        const loggedInDoctor = await Doctor.findById(existingDoctor._id).select(
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
                        user: loggedInDoctor,
                        refreshToken: refreshToken,
                        accessToken: accessToken,
                    },
                    "Current User Details"
                )
            );
    } catch (error) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Doctor Login Failed", error.message));
    }
});

const logoutDoctor = asyncHandler(async (req, res) => {
    try {
        logger.info("logoutDoctor");
        await Doctor.findByIdAndUpdate(
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
            .json(new ApiResponse(400, "User Logout Failed", error.message));
    }
});

const generateAccessAndRefreshToken = async (doc_id) => {
    try {
        logger.info("generateAccessAndRefreshToken");
        const doctor = await Doctor.findById(doc_id);
        if (!doctor) {
            throw new ApiError(404, "User Not Found");
        }
        const accessToken = doctor.generateAccessToken();
        const refreshToken = doctor.generateRefreshToken();
        user.refreshToken = refreshToken;
        await doctor.save();
        console.log({ accessToken, refreshToken });
        return { accessToken, refreshToken };
    } catch (error) {
        // logger.error(error.message, error);
        return error;
    }
};

const updateDoctor = asyncHandler(async (req, res) => {
    try {
        logger.info("updateDoctor");
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            throw new ApiError(404, "Doctor Not Found");
        }
        if (req.user._id.toString() !== doctor._id.toString()) {
            throw new ApiError(401, "Unauthorized Request");
        }
        const {
            username,
            password,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            address,
            qualification,
            specialization,
            hospitalAffiliation,
            licenseNumber,
            yearsOfExperience,
            primaryClinicAddress,
            clinicPhoneNumber,
            clinicEmail,
            consultationFees,
            notes,
        } = req.body;

        if (
            [
                username,
                password,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                phoneNumber,
                email,
                address.street,
                address.city,
                address.country,
                address.zipCode,
                address.state,
                qualification,
                specialization,
                hospitalAffiliation,
                licenseNumber,
            ].some((field) => !field || field === "")
        ) {
            throw new ApiError(400, "All fields are required");
        }
        (doctor.yearsOfExperience = yearsOfExperience),
            (doctor.primaryClinicAddress = primaryClinicAddress),
            (doctor.clinicPhoneNumber = clinicPhoneNumber),
            (doctor.clinicEmail = clinicEmail),
            (doctor.consultationFees = consultationFees),
            (doctor.notes = notes);

        const updatedDoctor = await doctor.save();
        if (!updatedDoctor) {
            throw new ApiError(500, "Doctor not updated");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedDoctor,
                    "Doctor updated successfully"
                )
            );
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error.message, "Update Doctor failed"));
    }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        logger.info("refreshAccessToken");
        const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decoded = jwt.verify(
            incomingToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const doctor = await Doctor.findById(decoded?.id);
        if (!doctor) {
            throw new ApiError(404, "Invalid Refresh Token");
        }
        if (doctor.refreshToken !== incomingToken) {
            throw new ApiError(401, "Access Token expired or used");
        }
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(doctor._id);

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

const getDoctorBy = asyncHandler(async (req, res) => {
    try {
        logger.info("getUserBy");
        if (req.params.id) {
            const doctor = await Doctor.findById(req.params.id).select(
                "-password -refreshToken"
            );
            if (!doctor) {
                throw new ApiError(404, "Doctor not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, doctor, "Doctor Details"));
        } else if (req.params.username) {
            const doctor = await Doctor.findOne({
                username: req.params.username,
            }).select("-password -refreshToken");
            if (!doctor) {
                throw new ApiError(404, "Doctor not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, doctor, "Doctor Details"));
        } else if (req.params.email) {
            const doctor = await Doctor.findOne({
                email: req.params.email,
            }).select("-password -refreshToken");
            if (!doctor) {
                throw new ApiError(404, "Doctor not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, doctor, "Doctor Details"));
        } else if (req.params.phoneNumber) {
            const doctor = await Doctor.findOne({
                phoneNumber: req.params.phoneNumber,
            }).select("-password -refreshToken");
            if (!doctor) {
                throw new ApiError(404, "Doctor not Found");
            }
            return res
                .status(200)
                .json(new ApiResponse(200, doctor, "Doctor Details"));
        }
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "Doctor Details Fetching Failed",
                    error.message
                )
            );
    }
});

const getAllDoctors = asyncHandler(async (req, res) => {
    try {
        logger.info("gerAllDoctors");
        const doctors = await Doctor.find().select("-password -refreshToken");
        return res
            .status(200)
            .json(new ApiResponse(200, doctors, "All Doctors' Details"));
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "All Doctors Details Fetching Failed",
                    error.message
                )
            );
    }
});

export {
    registerDoctor,
    loginDoctor,
    logoutDoctor,
    updateDoctor,
    refreshAccessToken,
    getDoctorBy,
    getAllDoctors,
};
