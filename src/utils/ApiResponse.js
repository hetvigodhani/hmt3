import logger from "../logger/index.js";

class ApiResponse {
    constructor(StatusCode, data, message = "Success") {
        this.StatusCode = StatusCode;
        this.message = message;
        this.success = StatusCode < 400;
        if (StatusCode >= 400) {
            this.errors = data;
            // logger.log(
            //     "error",
            //     `${this.StatusCode} - ${this.message} - ${this.errors}`
            // );
        } else {
            this.data = data;
        }
    }
}
export default ApiResponse;
