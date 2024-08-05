// // user.controller.test.js
// import { registerUser, loginUser } from '../controllers/user.controller';
// import { jest } from '@jest/globals';

// jest.mock('../middlewares/multer.middleware', () => ({
//     upload: {
//         single: jest.fn()
//     }
// }));

// jest.mock('../middlewares/auth.middleware', () => ({
//     verifyAdmin: jest.fn(),
//     verifyJwt: jest.fn()
// }));

// // Write your test cases for user controller functions here

// // appointment.controller.test.js
// import { addAppointment, getAppointment } from '../controllers/appointment.controller';
// import { jest } from '@jest/globals';

// jest.mock('../middlewares/auth.middleware', () => ({
//     verifyJwt: jest.fn()
// }));

// // Write your test cases for appointment controller functions here

// // record.controller.test.js
// import { addRecord, getRecord } from '../controllers/record.controller';
// import { jest } from '@jest/globals';

// jest.mock('../middlewares/auth.middleware', () => ({
//     verifyJwt: jest.fn()
// }));

// jest.mock('../middlewares/multer.middleware', () => ({
//     upload: {
//         array: jest.fn()
//     }
// }));

// // Write your test cases for record controller functions here

// // security.middleware.test.js
// import { rateLimiter, inputSanitizer, logRequest } from '../middlewares/security.middleware';
// import { jest } from '@jest/globals';

// // Write your test cases for security middleware functions here
