import { Router } from "express";
import { spotifyCallback } from "../controllers/user.controller.js";
import { authenticateUser } from '../middlewares/auth.middleware.js'

const router = Router();

router.route('/spotify-callback').get(spotifyCallback);
router.route('/top-tracks').get(authenticateUser, topTracks);
router.route('/top-artists').get(authenticateUser, topArtists);
router.route('/recent-tracks').get(authenticateUser, mostRecentTracks);
router.route('/roast-json').get(authenticateUser, getRoastJSON);

export default router;