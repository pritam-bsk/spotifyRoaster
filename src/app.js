import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
app.use(express.urlencoded({ extended: true }));

import userRouter from './routes/user.route.js';
import CallbackRouter from './routes/spotify.route.js'

app.use('/user', userRouter);
app.use('/api/v1', CallbackRouter)

export default app;

