import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
import paymentRouter from './routes/payment.route.js';
dotenv.config();


const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)

const PORT= process.env.PORT || 6000;

app.get('/', (req, res) => {
    return res.json({message:"Server Started"});
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB()
});