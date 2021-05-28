import express from 'express';
import cors from 'cors';
import helmet from 'helmet';


import {Logger} from './middlewares/MyLogger';

import { UserDB , TaskDB , UserTaskPassedDB, TaskCategoryDB ,   } from './models';


import apiRouter from './routes/api';
import managerRouter from './routes/manager';

const app = express();

app.use( cors() );
app.use( helmet() );
app.use( express.json() );
app.use(express.urlencoded({ extended: true }));


app.use( Logger() );

app.set("view engine" , "pug");
app.set('views','./views');

app.use("/public" , express.static("public") );

app.use('/api', apiRouter);
app.use('/manager' , managerRouter);

app.get( "/" , ( request : express.Request , response : express.Response ) => {
    response.send( "Hello World" );
} );

app.post( "/" , ( request : express.Request , response : express.Response ) => {
    response.send( "Hello World" );
} );

app.listen(5000 , "127.0.0.1" , () => {
    console.log( "Server Started : 127.0.0.1:5000" );
    UserDB.sync();
    TaskCategoryDB.sync();
    TaskDB.sync();
    UserTaskPassedDB.sync();
} );

