import express , { Request , Response , NextFunction} from 'express';
import fs from 'fs';

const LoggerDir = "./logging/";

const getFormatedTime = () => {
    const date = new Date();
    return {
        date : date.toLocaleString().split(',')[0].trim().replace(/[:\/]/gmi , '_'),
        time : date.toLocaleString().split(',')[1].trim()
    }
}

const parseXAuthHeader = ( request :  Request ) => {

    const xAuthHeader = request.headers["x-auth-token"];
    return xAuthHeader ?  JSON.parse( Buffer.from( xAuthHeader as string , 'base64' ).toString() ) : null
}



export const Logger = () =>  ( request : Request , response : Response,
    next : NextFunction ) =>
{
    if( !fs.existsSync( LoggerDir ) ){fs.mkdirSync( LoggerDir );}

    const formatedTime : { time : string , date : string } = getFormatedTime();
    const  logFileName = `${LoggerDir}/log_${formatedTime.date}.json`;
    const timeStamp : string = formatedTime.date + "-" + formatedTime.time;
    const method : string = request.method;
    const ip : string = request.ip;
    const path : string =  request.path;
    const protocol : string =  request.protocol;
    const  xAuthHeader =  parseXAuthHeader(request);
    fs.appendFile( logFileName ,
        JSON.stringify(
            {
                timeStamp ,
                method  ,
                ip ,
                path ,
                protocol ,
                gradeBookNumber: xAuthHeader?.gradeBookNumber ,
                userAgent : request.headers["user-agent"]

            } ) + "\n" , (err) => err ? console.log( err ) : null );
    next();
}