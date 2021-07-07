import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import {Logger} from './middlewares/MyLogger';

import { ProjectStructChecker } from './middlewares/ProjectStructChecker';

import apiRouter from './routes/api';
import managerRouter from './routes/manager';

ProjectStructChecker();

const app = express();
app.use( cors() );
app.use( helmet() );
app.use( express.json() );
app.use(express.urlencoded({ extended: true }));



app.use( Logger() );

app.use("/public" , express.static("public") );
app.use('/api', apiRouter);
app.use('/manager' , managerRouter);

app.listen(5000 , "0.0.0.0" , () => {
    console.log( "Server Started : 0.0.0.0:5000" );
} );

