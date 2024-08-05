import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { addressSchema, roleEnum } from "../constants.js";

const doctorSchema = new mongoose.Schema(
    {
        username: {
            unique: true,
            type: String,
            required: true,
            minlength: [3, "Username must be at least 3 characters long"],
            maxlength: [100, "Username must be less than 100 characters long"],
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
        },
        isInactive: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: roleEnum.DOCTOR,
        },
        firstName: {
            type: String,
            required: true,
            minlength: 2,
        },
        lastName: {
            type: String,
            required: true,
            minlength: 2,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^\+?\d{10,15}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid phone number!`,
            },
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        address: {
            type: addressSchema,
            required: true,
        },
        profilePicture: {
            type: String,
        },
        qualification: {
            type: String,
            required: true,
            minlength: 3,
        },
        specialization: {
            type: String,
            required: true,
        },
        yearsOfExperience: {
            type: Number,
            min: 0,
        },
        hospitalAffiliation: {
            type: String,
            required: true,
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
        },
        primaryClinicAddress: {
            type: String,
        },
        clinicPhoneNumber: {
            type: String,
            minlength: 10,
            maxlength: 15,
        },
        clinicEmail: {
            type: String,
            trim: true,
        },
        consultationFees: {
            type: Number,
            default: 0.0,
        },

        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

doctorSchema.post("find", async function (docs) {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    await Promise.all(
        docs.map(async (doc) => {
            if (doc.updatedAt < fiveYearsAgo) {
                doc.isInactive = true;
                await doc.save();
            }
        })
    )
        .then(() => {
            logger.info("Doctor updated");
        })
        .catch((err) => {
            logger.error("At doctor model: " + err);
        });
});

doctorSchema.methods.isPasswordCorrect = async function (password) {
    // logger.info(password);
    // logger.info(this.password);
    return bcrypt.compareSync(password, this.password);
};

doctorSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            role: "doctor",
            firstName: this.firstName,
            lastName: this.lastName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

doctorSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const Doctor = mongoose.model("Doctor", doctorSchema);
