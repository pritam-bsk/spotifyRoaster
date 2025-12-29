import { Router } from "express";
import { logout,userLogin, userMe } from "../controllers/user.controller.js";
import { authenticateUser } from '../middlewares/auth.middleware.js'

const userRouter = Router();

userRouter.route('/login').get(userLogin);
userRouter.route('/me').get(authenticateUser, userMe);
userRouter.route('/logout').post(logout);

export default userRouter;