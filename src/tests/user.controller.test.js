import { registerUser, loginUser } from '../controllers/user.controller.js';
import { jest } from '@jest/globals';

jest.mock('../middlewares/multer.middleware', () => ({
    upload: {
        single: jest.fn()
    }
}));

jest.mock('../middlewares/auth.middleware', () => ({
    verifyAdmin: jest.fn(),
    verifyJwt: jest.fn()
}));

// Write your test cases for user controller functions here
