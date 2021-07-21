import express, {RouterOptions , Request , Response, Router, response, NextFunction, request} from 'express';
import {
    UserDB,
    TaskDB,
    UserTaskPassedDB,
    TaskCategoryDB,
    WrongAnswersDB,
    UserScoresDB,
    TaskToTeamLinkTable, UserToTeamLinkTable, TeamScoresDB
} from '../models';

import {v4 as uuidv4 , v5 as uuidv5} from 'uuid';

import crypto  from 'crypto';
import {
    BrowserFingerprintInterface,
    RequestLoginType,
    RequestRegisterErrorType,
    RequestRegisterType,
    SessionUserAuthData
} from "./@types/api";
import TaskToTeam_lt from "../models/lt/TaskToTeam_lt";
import TeamScores from "../models/TeamScores";



export const TEMPORARY_KEY_STORAGE : Map<string, SessionUserAuthData> = new Map<string, SessionUserAuthData>();
export const TEMPORARY_KEY_STORAGE_LIFETIME = 4 * 60 * 60 * 1000;


export function validateRegisterRequest( data : RequestRegisterType  ) : RequestRegisterErrorType
{
    const errorReport : RequestRegisterErrorType = {
        firstName  : true,
        lastName : true,
        gradeBookNumber  : true,
        password : true
    };

    if( !data.firstName )
    {
        errorReport.firstName = false;
    }
    else if(data.firstName.length <= 4)
    {
        errorReport.firstName = false;
    }

    if( !data.lastName )
    {
        errorReport.lastName = false;
    }
    else if( data.lastName.length <= 4 )
    {
        errorReport.lastName = false;
    }

    if( !data.gradeBookNumber )
    {
        errorReport.gradeBookNumber = false;
    }
    else if( data.gradeBookNumber.length < 8 )
    {
        errorReport.gradeBookNumber = false;
    }

    if( !data.password || !data.confirmPassword )
    {
        errorReport.password = false;
    }
    else if( data.password.length < 8 ||
             data.password !== data.confirmPassword
             )
    {
        errorReport.password = false;
    }

    return errorReport;

}

export function checkAuthMiddleware( request : Request , response : Response , next : NextFunction):void
{
    const authData : SessionUserAuthData = JSON.parse( Buffer.from( request.headers["x-auth-token"]  as string, "base64" ).toString("utf-8")  );
    const suspFingerprint = {
        browserFingerprint :  JSON.parse( Buffer.from( request.headers["x-finger-data"]  as string, "base64" ).toString("utf-8")  ),
        userAgent : request.headers["user-agent"],
        userIp :  request.ip
    }

    if( authData?.gradeBookNumber ){

        response.locals.gradeBookNumber = authData?.gradeBookNumber;

        const serverSideAuthData : SessionUserAuthData = TEMPORARY_KEY_STORAGE.get( authData.gradeBookNumber );
        if( serverSideAuthData )
        {
            if(
                JSON.stringify(suspFingerprint) ===  JSON.stringify(serverSideAuthData.fingerprint) &&
                serverSideAuthData.token === authData?.token &&
                serverSideAuthData.uuid === authData?.uuid
            ){
                next();
            }
            else{
                response.status(403).end();
            }
        }
        else
        {
            response.status(403).end();
        }
    }

}



const apiRouter: Router  = express.Router();

apiRouter.post("/", checkAuthMiddleware , (  request : Request , response : Response ) => {
    response.status(200).send( "<div style='position:absolute;top:25%;left:25%;align-items:center;'> <h1 style='color:#ff0000;font-size:25px;'> Саламалейкум :) </h1></div>");
});

apiRouter.post( "/register" , async( request: Request , response:Response ) => {
    const userData : RequestRegisterType = request.body;
    const errorReport : RequestRegisterErrorType = validateRegisterRequest( userData );

    for( const [key, value]  of Object.entries( errorReport ) )
    {
        if( !value )
        {
            response.json( errorReport );
            return;
        }
    }

    UserDB.findAll( {
        where : {
            gradeBookNumber: userData.gradeBookNumber,
            deleted :  false
        }
    }).then( (data : object[]) => {
        if( !data.length )
        {
            const sha256 = crypto.createHash('sha256');
            sha256.update( userData.password );

            UserDB.create({
                uid : uuidv4(),
                gradeBookNumber : userData.gradeBookNumber,
                firstName : userData.firstName,
                lastName : userData.lastName,
                password : sha256.digest("hex"),
                uuid : uuidv4(),
                secretToken :  crypto.randomBytes(64).toString("base64")
            })
            .then(() => response.json( { success : true } ))
            .catch( () => response.json( { success : false  , errorText : "Save error"} ));
            sha256.end();
        }else{
            response.json( { success : false , errorText : "The user is already registered" } )
        }

    } )
    .catch( () => response.json( { success : false , errorText : "Server Error" } ) )
});

apiRouter.post("/login" ,(request : Request , response : Response) => {
    const userData : RequestLoginType = request.body;

    const browserFingerprint :BrowserFingerprintInterface = JSON.parse( Buffer.from( request.headers["x-finger-data"]  as string, "base64" ).toString("utf-8")  );
    const userAgent : string  = request.headers["user-agent"];
    const userIp : string = request.ip;

    UserDB.findOne(
        {
            where : { gradeBookNumber  : userData.gradeBookNumber  , deleted :  false}
        })
    .then( user => {

        if( user )
        {
            const secretToken :string = user.getDataValue('secretToken');
            const password :string = user.getDataValue('password');

            const sha256 = crypto.createHash('sha256');
            sha256.update( userData.password );

            if ( sha256.digest('hex') === password  )
            {
                const sessionData : SessionUserAuthData = { token : '' , uuid : '' , gradeBookNumber : userData.gradeBookNumber , userId : user.uid };

                sessionData.token = crypto.randomBytes(32).toString("hex");
                sessionData.uuid = uuidv5(secretToken , uuidv4() ) ;
                sessionData.fingerprint = {
                    browserFingerprint,
                    userAgent,
                    userIp
                }

                if ( TEMPORARY_KEY_STORAGE.has(  userData.gradeBookNumber ) )
                {
                    TEMPORARY_KEY_STORAGE.delete( userData.gradeBookNumber );
                }

                TEMPORARY_KEY_STORAGE.set( userData.gradeBookNumber , sessionData );

                setTimeout( ( gradeBookNumber : string ) => {
                    if( TEMPORARY_KEY_STORAGE.has( gradeBookNumber )){
                        TEMPORARY_KEY_STORAGE.delete( gradeBookNumber  );
                    }
                },
                TEMPORARY_KEY_STORAGE_LIFETIME,
                userData.gradeBookNumber
                );
                const { uuid , gradeBookNumber , token }  = sessionData;
                response.json(   { uuid , gradeBookNumber , token }  );
            }
            else
            {
                response.json( { authorized : false } );
            }
            sha256.end();
        }
        else
        {
            response.json({ authorized : false } );
        }
    }).catch(_ => response.json({ authorized : false }));
});

apiRouter.post("/taskCategories/:category" , checkAuthMiddleware , (request : Request , response:Response) => {
    try {
        TaskCategoryDB.findOne(
            {
                where : { shortName : request.params.category }
            }
        )
            .then( data => {
                if( data?.uid ){
                    TaskDB.findAll(
                        {
                            where : { categoryId : data.uid },
                            attributes : ['uid' , 'title' , "categoryId" , "description" , "filePath" , "titleImage" , "score"]

                        }
                    ).then( taskRows => {

                        const { userId }  = TEMPORARY_KEY_STORAGE.get( response.locals.gradeBookNumber );

                        UserTaskPassedDB.findAll( {
                            where : { userId },
                            attributes : ['taskId']
                        } )
                        .then(  userTaskPassed => {

                            const tasks = taskRows.map( item => {
                                for( const it of userTaskPassed )
                                {
                                    if ( it.taskId === item.uid )
                                    {
                                        return { ...item  , passed : true }
                                    }
                                }
                                return { ...item  , passed : false }
                            } );
                            response.json( tasks );
                        } )
                        .catch( _ => response.json(  taskRows )  );
                    } ).catch( _ => response.json([]));
                }else{ response.json( []); }
            });
    }catch (ex)
    {
        response.json( [] );
    }
});


apiRouter.post("/taskCategories" , checkAuthMiddleware  ,  ( request : Request , response : Response ) => {
    TaskCategoryDB.findAll()
        .then( data => {
            response.json( data );
        } )
        .catch( _ => response.json({  }));
} );

apiRouter.post("/task/checkTaskAnswer" , checkAuthMiddleware , (request:Request , response:Response) => {

    interface AnswerDataInterface{
        answer : string,
        taskId : string
    }

    const { answer  , taskId  } : AnswerDataInterface = request.body;

    TaskDB.findOne( {
        where : {uid : taskId},
        attributes : [ "answer" , "score" , "categoryId" ]
    } )
    .then( taskDBResult => {
        const { gradeBookNumber } = response.locals;
        const { userId } = TEMPORARY_KEY_STORAGE.get( gradeBookNumber );
        if( taskDBResult.answer === answer )
        {
                UserTaskPassedDB.findAll( {
                    where : { taskId  ,  userId } ,
                    attributes : [ 'uid' ] }
                )
                .then( userTaskPassedResult => {
                    if( userTaskPassedResult.length ){
                        response.json(  { success : true , score : 0 }  );
                    }
                    else
                    {
                        UserTaskPassedDB.create(
                            {
                                uid : uuidv4(),
                                taskId ,
                                userId,
                                categoryId : taskDBResult.categoryId,
                            }
                         )
                         .then( _ => { response.json( { success : true , score : taskDBResult.score }  ) } )
                         .catch(console.log);

                        UserToTeamLinkTable.findOne(
                            {
                                where : {userId},
                                attributes: ['teamId']
                            }
                        ).then( result => {
                            if( result?.teamId )
                            {
                                TaskToTeamLinkTable.create( {
                                    uid : uuidv4(),
                                    teamId : result.teamId ,
                                    taskId
                                } ).catch(console.log);

                                TeamScoresDB.findOne( {
                                    where : {uid : result.teamId},
                                } ).then( tsResult => {
                                    if( tsResult?.scores  )
                                    {
                                        tsResult.update({    scores : tsResult.scores +  taskDBResult.score }).catch(console.log);
                                    }
                                    else
                                    {
                                        TeamScoresDB.create( { teamId : result.teamId , scores : taskDBResult.score , uid : uuidv4() } ).catch(console.log);
                                    }
                                }).catch(console.log);
                            }

                        });

                        UserScoresDB.findOne(
                            {
                                where : { userId }
                            }
                        ).then( userScoresResult => {
                            if ( userScoresResult?.userId )
                            {
                                UserScoresDB.update({ scores : userScoresResult.scores + taskDBResult.score } , {
                                    where : {userId}
                                }).catch(console.log);
                            }
                            else
                            {
                                UserScoresDB.create(
                                    {
                                        uid : uuidv4(),
                                        userId ,
                                        scores : taskDBResult.score
                                    }
                                ).catch(console.log);
                            }
                        } ).catch(console.log);
                        ;
                    }
                } )
        }
        else
        {
            response.json(  {success : false}  )
            WrongAnswersDB.create(
                {
                    uid : uuidv4(),
                    userId,
                    taskId ,
                    categoryId : taskDBResult.categoryId,
                    answer
                }
            )
                .catch(console.log);
        }
    })
    .catch( () => response.json({success : false}) );
});

apiRouter.post("/task/getScoresForCurrentUser" , checkAuthMiddleware , (request : Request , response : Response) => {
    const {gradeBookNumber} = response.locals;
    const { userId }  = TEMPORARY_KEY_STORAGE.get( gradeBookNumber );

    UserScoresDB.findOne( { where : {userId} } )
        .then( userScoresResult => {
            if( userScoresResult?.scores ){
                response.json( {scores : userScoresResult.scores }  );
            }
            else {
                response.json( {scores : 0 }  );
            }
        } )
        .catch(console.log);
});


export default apiRouter;