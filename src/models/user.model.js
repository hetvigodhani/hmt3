import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../logger/index.js";
import { roleEnum, genderEnum, addressSchema } from "../constants.js";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            minlength: [3, "Username must be at least 3 characters long"],
            maxlength: [100, "Username must be less than 100 characters long"],
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: roleEnum,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^\+?\d{10,15}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid phone number!`,
            },
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: genderEnum,
            required: true,
        },
        address: {
            type: addressSchema,
        },
        refreshToken: {
            type: String,
        },
        profilePicture: {
            type: String,
        },
        isInactive: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);
// inactiveUser,
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});
userSchema.post("find", async function (docs) {
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
            logger.info("Users updated");
        })
        .catch((err) => {
            logger.error("At user model: " + err);
        });
});

userSchema.methods.isPasswordCorrect = async function (password) {
    // logger.info(password);
    // logger.info(this.password);
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            role: this.role,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
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

export const User = mongoose.model("User", userSchema);
