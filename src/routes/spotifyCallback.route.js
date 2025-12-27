import { Router } from "express";
import { spotifyCallback } from "../controllers/user.controller.js";

const router = Router();

router.route('/spotify-callback').get(spotifyCallback);

export default router;