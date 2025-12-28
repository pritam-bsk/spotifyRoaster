import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    spotify_user_id: { type: String, required: true, unique: true },
    display_name: { type: String },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);