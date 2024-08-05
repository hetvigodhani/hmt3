import { addAppointment, getAppointment } from '../controllers/appointment.controller.js';
import { jest } from '@jest/globals';

jest.mock('../middlewares/auth.middleware', () => ({
    verifyJwt: jest.fn()
}));