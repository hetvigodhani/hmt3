import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    addRecord,
    getRecord,
    updateRecord,
    deleteRecord,
} from "../controllers/record.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.use(verifyJwt);

// contains medical records related routes
router.route("/add-record").post(upload.array("recordUrl", 20), addRecord);
router.route("/get-record").get(getRecord);
router
    .route("/update-record")
    .patch(upload.array("recordUrl", 20), updateRecord);
router.route("/delete-record").delete(deleteRecord);

export default router;
