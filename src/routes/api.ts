import express, {RouterOptions , Request , Response, Router, response, NextFunction, request} from 'express';
import { UserDB , TaskDB , UserTaskPassedDB , TaskCategoryDB } from '../models';

import {v4 as uuidv4 , v5 as uuidv5} from 'uuid';

import crypto  from 'crypto';
import {RequestLoginType, RequestRegisterErrorType, RequestRegisterType, SessionUserAuthData} from "./@types/api";



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

    if( authData?.gradeBookNumber ){

        response.locals.gradeBookNumber = authData?.gradeBookNumber;

        const serverSideAuthData : SessionUserAuthData = TEMPORARY_KEY_STORAGE.get( authData.gradeBookNumber );

        if( serverSideAuthData )
        {
            if( serverSideAuthData.token === authData?.token &&
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

export const TEMPORARY_KEY_STORAGE : Map<string, SessionUserAuthData> = new Map<string, SessionUserAuthData>();
export const TEMPORARY_KEY_STORAGE_LIFETIME = 4 * 60 * 60 * 1000;

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
            response.send( errorReport );
            return;
        }
    }

    UserDB.findAll( {
        where : {
            gradeBookNumber: userData.gradeBookNumber
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
            .then(() => response.send( { success : true } ))
            .catch( () => response.send( { success : false  , errorText : "Save error"} ));
            sha256.end();
        }else{
            response.json( { success : false , errorText : "The user is already registered" } )
        }

    } )
    .catch( () => response.json( { success : false , errorText : "Server Error" } ) )
});

apiRouter.post("/login" ,(request : Request , response : Response) => {
    const userData : RequestLoginType = request.body;
    UserDB.findOne(
        {
            where : { gradeBookNumber  : userData.gradeBookNumber }
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

                if ( TEMPORARY_KEY_STORAGE.has(  userData.gradeBookNumber ) ){ TEMPORARY_KEY_STORAGE.delete( userData.gradeBookNumber ); }

                TEMPORARY_KEY_STORAGE.set( userData.gradeBookNumber , sessionData );

                setTimeout( ( gradeBookNumber : string ) => {
                    if( TEMPORARY_KEY_STORAGE.has( gradeBookNumber )){
                        TEMPORARY_KEY_STORAGE.delete( gradeBookNumber  );
                    }
                },
                TEMPORARY_KEY_STORAGE_LIFETIME,
                userData.gradeBookNumber
                );

                response.json(   sessionData  );
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
    });
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
    try {
        TaskCategoryDB.findAll()
            .then( data => {
                response.json( data );
            } )
            .catch( _ => response.json({  }));
    }catch (ex)
    {
        response.json( {  } );
    }

} );

apiRouter.post("/task/checkTaskAnswer" , checkAuthMiddleware , (request:Request , response:Response) => {

    interface AnswerDataInterface{
        answer : string,
        uid : string
    }

    const {answer  , uid } : AnswerDataInterface = request.body;

    TaskDB.findOne( {
        where : {uid},
        attributes : [ "answer" , "score" ]
    } )
    .then( taskDBResult => {
        if( taskDBResult.answer === answer )
        {

            const { gradeBookNumber } = response.locals;
            const { userId } = TEMPORARY_KEY_STORAGE.get( gradeBookNumber );

                UserTaskPassedDB.findAll( {
                    where : { taskId : uid ,  userId } ,
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
                                taskId : uid,
                                userId,
                                score : taskDBResult.score
                            }
                         )
                         .then( _ => { response.json( { success : true , score : taskDBResult.score }  ) } )
                         .catch(console.log);
                    }
                } )
        }
        else
        {
            response.json(  {success : false}  )
        }
    })
    .catch( () => response.json({success : false}) );
});

apiRouter.post("/task/getScoresForCurrentUser" , checkAuthMiddleware , (request : Request , response : Response) => {
    const {gradeBookNumber} = response.locals;
    const { userId }  = TEMPORARY_KEY_STORAGE.get( gradeBookNumber );

        UserTaskPassedDB.findAll({
            where : { userId },
            attributes : [ 'score' ]
        })
        .then( taskPassedResult => {
            let scoreSum = 0;
            for( const i of taskPassedResult ){
                scoreSum += i.score;
            }
            response.send( JSON.stringify( {scores : scoreSum } ) );
        } )
});


export default apiRouter;