import { Router } from "express";
import { spotifyCallback } from "../controllers/user.controller.js";
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { generateRoast } from "../controllers/gemini.controller.js";
import { topTracks, topArtists, mostRecentTracks, getRoastJSON } from "../controllers/user.controller.js";

const router = Router();

router.route('/spotify-callback').get(spotifyCallback);
router.route('/top-tracks').get(authenticateUser, topTracks);
router.route('/top-artists').get(authenticateUser, topArtists);
router.route('/recent-tracks').get(authenticateUser, mostRecentTracks);
router.route('/roast-json').get(authenticateUser, getRoastJSON);
router.route('/genarate-roast').get(authenticateUser, generateRoast)

export default router;