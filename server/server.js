import { config } from 'dotenv';
config();
import app from './app.js';
import connectionDB from './config/dbConnection.js';


const PORT = process.env.PORT || 5000;

app.listen(PORT, async() => {
    await connectionDB();
    console.log(`Server listening at http:localhost:${PORT}`);
})