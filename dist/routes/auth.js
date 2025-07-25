"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', AuthController_1.AuthController.register);
router.post('/login', AuthController_1.AuthController.login);
router.get('/verify-email/:userId/:token', AuthController_1.AuthController.verifyEmail);
router.post('/resend-verification', AuthController_1.AuthController.resendVerificationEmail);
router.post('/forgot-password', AuthController_1.AuthController.forgotPassword);
router.post('/reset-password/:email/:token', AuthController_1.AuthController.resetPassword);
router.get('/me', auth_1.auth, AuthController_1.AuthController.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.js.map