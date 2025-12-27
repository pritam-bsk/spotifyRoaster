import { Router } from "express";
import { userLogin } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route('/login').get(userLogin);

export default userRouter;