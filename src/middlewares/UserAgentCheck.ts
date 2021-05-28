import express , { Request , Response , NextFunction } from 'express';

export const UserAgentCheck = () => ( request : Request , response : Response,
                                next : NextFunction ) =>
{
    const userAgent : string = request.headers['user-agent'];
    const userAgentKeyWords : RegExp[] = [  /python/gmi , /nmap/gmi  , /nikto/gmi , /openvas/gmi
                                                , /greeenbone/gmi , /spider/gmi , /links/gmi ];
    let isPassed : boolean = true
    if( userAgent.length <= 32 ){isPassed = false;}
    for( const regexp of userAgentKeyWords )
    {
        if( regexp.test( userAgent ) )
        {
            isPassed = false;
            break;
        }
    }

    if( isPassed  ){    next();    }

}