import { Request , Response , NextFunction } from 'express';

export const XSSCheck = () => (  request : Request , response : Response , next : NextFunction ) => {
    const XSSRegExp : RegExp = new RegExp('(\<(/?[^\>]+)\>)', 'gmi');
    let reqBody : string = null;

    if( request.method === "GET" )
    {
        reqBody = JSON.stringify( request.query );
    }
    else if ( request.method === "POST" )
    {
        reqBody = JSON.stringify(request.body);
    }

    if( reqBody && !XSSRegExp.test( reqBody ))
    {
        next();
    }
    response.connection.destroy();
}