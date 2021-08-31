import express , { Request , Response , NextFunction} from 'express';
import fs from 'fs';

const LoggerDir = "./logging/";



const parseXAuthHeader = ( request :  Request ) => {
    const xAuthHeader = request.headers["x-auth-token"];
    return xAuthHeader ?  JSON.parse( Buffer.from( xAuthHeader as string , 'base64' ).toString() ) : null
}



export const Logger = () =>  ( request : Request , response : Response,
    next : NextFunction ) =>
{
    if( !fs.existsSync( LoggerDir ) ){fs.mkdirSync( LoggerDir );}

    (async () => {

            const date = new Date();

            const  logFileName = `${LoggerDir}/log_${date.toLocaleString('ru').split(" ")[0].replace(/,/, '')}.json`;
            const timeStamp : number = Date.now();
            const datetime : string = date.toLocaleString('ru');
            const method : string = request.method;
            const ip : string = request.ip;
            const path : string =  request.path;
            const protocol : string =  request.protocol;
            const  xAuthHeader =  parseXAuthHeader(request);
            fs.appendFile( logFileName ,
                JSON.stringify(
                    {
                        timeStamp ,
                        datetime ,
                        method  ,
                        ip ,
                        path ,
                        protocol ,
                        gradeBookNumber: xAuthHeader?.gradeBookNumber ,
                        userAgent : request.headers["user-agent"]

                } ) + "\n" , console.error );
    }
    )();


    next();
}
