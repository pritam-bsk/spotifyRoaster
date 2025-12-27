import { Router } from "express";
import { userLogin, userMe, topTracks, topArtists, mostRecentTracks } from "../controllers/user.controller.js";
import { authenticateUser } from '../middlewares/auth.middleware.js'

const userRouter = Router();

userRouter.route('/login').get(userLogin);
userRouter.route('/me').get(authenticateUser, userMe);
userRouter.route('/top-tracks').get(authenticateUser, topTracks);
userRouter.route('/top-artists').get(authenticateUser, topArtists);
userRouter.route('/recent-tracks').get(authenticateUser, mostRecentTracks);


export default userRouter;