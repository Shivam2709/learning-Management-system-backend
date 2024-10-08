import  express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
config();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import miscellaneousRoutes from './routes/miscellaneous.routes.js'
import coursesRoutes from './routes/course.routes.js'
import PaymentRoutes from './routes/payment.route.js'
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin:`http://localhost:${process.env.FRONTEND_URL}`,
    credentials: true
}));

app.use(cookieParser());
app.use(morgan('dev'));

app.use('/ping', function(req, res){
    res.send('/pong')
});

// routes of 3 modules
app.use('/api/v1', miscellaneousRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/courses', coursesRoutes)
app.use('/api/v1/payments', PaymentRoutes)

app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 page not found')
});

app.use(errorMiddleware);

export default app;