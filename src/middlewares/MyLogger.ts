import express , { Request , Response , NextFunction } from 'express';
import fs from 'fs';

const LoggerDir = "./logging/";

const getFormatedTime = () => {
    const date = new Date();

    const fullYear : string = date.getFullYear().toString();
    const month : string  = date.getMonth() >= 10 ? date.getMonth().toString() : "0" +  date.getMonth().toString();
    const day : string = date.getDay() >= 10 ? date.getDay().toString() : "0" +  date.getDay().toString();
    const hours : string = date.getHours() >= 10 ? date.getHours().toString() : "0" + date.getHours().toString();
    const minutes : string = date.getMinutes() >= 10 ? date.getMinutes().toString() : "0" + date.getMinutes().toString();
    const seconds : string = date.getSeconds() >= 10 ? date.getSeconds().toString() : "0" + date.getSeconds().toString();

    return {
            date : `${ fullYear }.${month}.${day}`,
            time : `${hours}:${minutes}:${seconds}`
        }
}




export const Logger = () =>  ( request : Request , response : Response,
    next : NextFunction ) =>
{

    if( !fs.existsSync( LoggerDir ) ){fs.mkdirSync( LoggerDir );}

    const formatedTime : { time : string , date : string } = getFormatedTime();
    const  logFileName = `${LoggerDir}/log_${formatedTime.date}.json`
    const timeStamp : string = formatedTime.date + "-" + formatedTime.time;
    const method : string = request.method;
    const ip : string = request.ip;
    const path : string =  request.path;
    const protocol : string =  request.protocol;
    const grageBookNumber : string = request.body?.authData?.gradeBookNumber;

    fs.appendFile( logFileName , JSON.stringify( { timeStamp , method  , ip , path , protocol , gradeBookNumber: grageBookNumber } ) + "\n" , (err) => err ? console.log( err ) : null );
    next();
}