import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Record } from "../models/record.model.js";
import jwt from "jsonwebtoken";
import logger from "../logger/index.js";

const addRecord = asyncHandler(async (req, res) => {
    try {
        logger.info("addRecord");

        const {
            recordName,
            diagnosis,
            treatment,
            medication,
            notes,
            diagnosisDate,
            treatmentStartDate,
        } = req.body;

        if (
            [recordName, diagnosis, diagnosisDate].some(
                (field) => !field || field.trim() === ""
            )
        ) {
            throw new ApiError(
                400,
                "Record Name, Diagnosis or Diagnosis Date required"
            );
        }

        const token = req.cookies.accessToken || req.body.accessToken;
        const createdBy = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!createdBy) {
            throw new ApiError(401, "Unauthorized Request, No token provided");
        }
        // console.log("createdBy", createdBy);

        //upload files to cloud************************************
        const recordUrl = req.files?.map((file) => file.path) || [];
        if (recordUrl.length === 0) {
            throw new ApiError(400, "Record File required");
        }

        // const diagnosisDateF = ;
        // const treatmentDate =
        if (treatmentStartDate < diagnosisDate) {
            throw new ApiError(
                400,
                "Treatment Start Date cannot be before Diagnosis Date"
            );
        }

        const doc = {
            recordUrl: recordUrl,
            recordName: recordName,
            diagnosis: diagnosis,
            treatment: treatment || "",
            medication: medication || "",
            notes: notes || "",
            diagnosisDate: new Date(diagnosisDate),
            treatmentStartDate: treatmentStartDate
                ? new Date(treatmentStartDate)
                : new Date(diagnosisDate),
            createdBy: createdBy.id,
        };
        const record = await new Record(doc).save();
        if (!record) {
            throw new ApiError(500, "Record Addition Failed - Server Error");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, record, "Record Added Successfully"));
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Record Addition Failed: " + error.message)
            );
    }
});

const getRecord = asyncHandler(async (req, res) => {
    try {
        console.log("getRecord", req.body);

        const record = await Record.find({ createdBy: req.user._id });
        if (!record) {
            throw new ApiError(400, "Record Details Fetching Failed");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, record, "Record Details"));
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    "Record Details Fetching Failed" + error.message
                )
            );
    }
});

const updateRecord = asyncHandler(async (req, res) => {
    try {
        console.log("updateRecord", req.body);

        const [recordUrl, recordName, user_id] = req.body;
        if (!recordUrl || !recordName || !user_id) {
            throw new ApiError(400, "All Record Data required");
        }
        if (
            recordUrl.trim() === "" ||
            recordName.trim() === "" ||
            user_id.trim() === ""
        ) {
            throw new ApiError(400, "Invalid Record Data");
        }
        //    ********** Update Record **********1"
        // const record = await Record.findByIdAndUpdate(req.params.id, {
        //     recordUrl,
        //     recordName,
        //     user_id,
        // });
        return res
            .status(200)
            .json(
                new ApiResponse(200, req.body, "Record Updated Successfully")
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Record Updation Failed" + error.message)
            );
    }
});

const deleteRecord = asyncHandler(async (req, res) => {
    try {
        console.log("deleteRecord", req.body);

        await Record.findByIdAndDelete(req.params.id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, req.body, "Record Deleted Successfully")
            );
    } catch (error) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Record Deletion Failed" + error.message)
            );
    }
});

export { addRecord, getRecord, updateRecord, deleteRecord };
