import mongoose from 'mongoose';
import 'dotenv/config';

const userSchema = new mongoose.Schema({
    spotify_user_id: { type: String, required: true, unique: true, index: true },
    display_name: { type: String },
    email: { type: String },
    top_artist: { type: String },
    top_track: { type: String },
    image_url: { type: String }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);