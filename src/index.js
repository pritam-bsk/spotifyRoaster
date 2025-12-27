import express from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req,res)=>{
    res.json({
        message: "Hello, World!",
        status: "success"
    });
})

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});