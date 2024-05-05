"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./middleware/auth"));
const user_1 = __importDefault(require("./controllers/user"));
const login_1 = __importDefault(require("./controllers/login"));
const user_2 = __importDefault(require("./controllers/user"));
const router = (0, express_1.Router)();
//user
router.post('/user', user_1.default.createuser);
router.post('/login', login_1.default.authenticate);
//routes authenticated
router.put('/user', auth_1.default, user_1.default.updateuser);
router.get('/user', auth_1.default, user_1.default.user);
router.delete('/user/:id', auth_1.default, user_2.default.deleteuser);
exports.default = router;
