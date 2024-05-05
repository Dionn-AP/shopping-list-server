import { Router } from "express";

import authMiddleware from "./middleware/auth";
import User from "./controllers/user";
import Login from './controllers/login';
import user from "./controllers/user";

const router = Router();

//user
router.post('/user', User.createuser);
router.post('/login', Login.authenticate);


//routes authenticated
router.put('/user', authMiddleware, User.updateuser);
router.get('/user', authMiddleware, User.user);
router.delete('/user/:id', authMiddleware, user.deleteuser);


export default router;