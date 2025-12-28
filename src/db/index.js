import mongoose from "mongoose";

const DB_NAME = process.env.DB_NAME || "spotifyRoaster";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI + `/${DB_NAME}`, {
            dbName: DB_NAME,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
    }
}