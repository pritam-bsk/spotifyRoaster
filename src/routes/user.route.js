import { Router } from "express";
import { userLogin,userMe } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route('/login').get(userLogin);
userRouter.route('/me').get(userMe);

export default userRouter;