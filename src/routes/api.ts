import express, {RouterOptions , Request , Response, Router, response, NextFunction, request} from 'express';
import { UserDB , TaskDB , UserTaskPassedDB , TaskCategoryDB } from '../models';

import {v4 as uuidv4 , v5 as uuidv5} from 'uuid';

import crypto  from 'crypto';

export interface RequestRegisterType{
    firstName  : string,
    lastName : string,
    gradeBookNumber  : string,
    password : string,
    confirmPassword : string
}

export interface SessionUserAuthData{
    gradeBookNumber : string,
    token : string,
    uuid : string
}

export interface RequestLoginType{
    gradeBookNumber : string,
    password : string
}

export interface RequestRegisterErrorType{
    firstName  : boolean,
    lastName : boolean,
    gradeBookNumber  : boolean,
    password : boolean
}

export interface TaskAnswerInterface{
    taskId : number,
    answer : string,
}

function errorPlug(){
    return JSON.stringify({ success : false })
}

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

export function randint(min : number , max:number):number
{
    return Math.floor(( Math.random() * max ) + (min));
}

export function generateToken( length : number = 128 ) : string
{
    let token : string = "";
    for( let i:number = 0; i < length ;i++)
    {
        token += randint(100, 254).toString(16);
    }
    return token;
}

export function checkAuthMiddleware( request : Request , response : Response , next : NextFunction):void
{
    const authData : SessionUserAuthData = JSON.parse( Buffer.from( request.headers["x-auth-token"]  as string, "base64" ).toString("utf-8")  );

    // console.log( authData );
    response.locals.gradeBookNumber = authData.gradeBookNumber;

    if( authData?.gradeBookNumber ){
        const serverSideAuthData : SessionUserAuthData = TEMPORARY_KEY_STORAGE.get( authData.gradeBookNumber );

        if( serverSideAuthData )
        {
            if( serverSideAuthData.token === authData?.token &&
                serverSideAuthData.uuid === authData?.uuid
            ){
                next();
            }
            else{
                response.send( JSON.stringify({ token : null , uuid : null , gradeBookNumber : null }) );
            }
        }
        else
        {
            response.send( JSON.stringify({ token : null , uuid : null , gradeBookNumber : null }) );
        }
    }

}

export const TEMPORARY_KEY_STORAGE : Map<string, SessionUserAuthData> = new Map<string, SessionUserAuthData>();
export const TEMPORARY_KEY_STORAGE_LIFETIME = 3600000;

const apiRouter: Router  = express.Router();

apiRouter.post("/", ( request : Request , response : Response ) => {
    response.send( "<div style='position:absolute;top:25%;left:25%;align-items:center;'> <h1 style='color:#ff0000;font-size:25px;'> Саламалейкум :) </h1></div>");
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

        // console.log( data )
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
            .then(() => response.send( { successfully : true } ))
            .catch( () => response.send( { successfully : false  , errorText : "Ошибка сохранения"} ));
            sha256.end();
        }else{
            response.send( { successfully : false , errorText : "Пользователь уже зарегестрирован" } )
        }

    } )
    .catch( () => response.send( { successfully : false , errorText : "Ошибка Сервера" } ) )
});

apiRouter.post("/login" ,(request : Request , response : Response) => {
    const userData : RequestLoginType = request.body;

    // response.locals.gradeBookNumber = userData.gradeBookNumber;

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
                const sessionData : SessionUserAuthData = { token : '' , uuid : '' , gradeBookNumber : userData.gradeBookNumber };

                sessionData.token = generateToken(32);
                sessionData.uuid = uuidv5(secretToken , uuidv4() ) ;

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

                response.send(  JSON.stringify( sessionData ) );
            }
            else
            {
                response.send( JSON.stringify ({ authorized : false }) );
            }
            sha256.end();
        }
        else
        {
            response.send( JSON.stringify ({ authorized : false }) );
        }
    });
});


apiRouter.post( "/login/checkAuthData" , ( request : Request , response:Response ) =>{
    const authData : SessionUserAuthData = request.body;

    if( TEMPORARY_KEY_STORAGE.has(authData.gradeBookNumber) )
    {
        const serverSideAuthData : SessionUserAuthData = TEMPORARY_KEY_STORAGE.get( authData.gradeBookNumber );
        // console.log( authData , serverSideAuthData);
        if( serverSideAuthData.uuid === authData.uuid && serverSideAuthData.token === authData.token )
        {
            response.send( JSON.stringify( authData ) );
        }else
        {
            response.send( JSON.stringify({ token : null , uuid : null , gradeBookNumber : null }) );
        }
    }
    else
    {
        response.send( JSON.stringify({ token : null , uuid : null , gradeBookNumber : null }) );
    }
} )

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
                    ).then( rows => {
                        response.send( rows );
                    } ).catch( _ => response.send({  }));
                }else{ response.send( {  } ); }
            });
    }catch (ex)
    {
        // console.log(ex);
        response.send( {  } );
    }
});


apiRouter.post("/taskCategories" , checkAuthMiddleware  ,  ( request : Request , response : Response ) => {
    try {
        TaskCategoryDB.findAll()
            .then( data => {
                response.send( data );
            } )
            .catch( _ => response.send({  }));
    }catch (ex)
    {
        // console.log(ex);
        response.send( {  } );
    }

} );

apiRouter.post("/task/checkTaskAnswer" , checkAuthMiddleware , (request:Request , response:Response) => {

    interface AnswerDataInterface{
        answer : string,
        uid : string
    }

    const {answer  , uid} : AnswerDataInterface = request.body;

    // const  sha256 = crypto.createHash('sha256');
    // sha256.update( answer.trim() );

    TaskDB.findOne( {
        where : {uid},
        attributes : [ "answer" , "score" ]
    } )
    .then( taskDBResult => {
        if( taskDBResult.answer === answer )
        {

            const { gradeBookNumber } = response.locals;


            UserDB.findOne({
                where : { gradeBookNumber },
                attributes : ["uid"]
            })
            .then( userDBResult  => {

                UserTaskPassedDB.findAll( {
                    where : { taskId : uid } ,
                    attributes : [ 'uid' ] }
                )
                .then( userTaskPassedResult => {
                    if( userTaskPassedResult.length ){
                        response.send( JSON.stringify( { success : true , score : 0 } ) )
                    }
                    else
                    {
                        UserTaskPassedDB.create(
                            {
                                uid : uuidv4(),
                                taskId : uid,
                                userId : userDBResult.uid,
                                score : taskDBResult.score
                            }
                         )
                         .then( _ => { response.send( JSON.stringify( { success : true , score : taskDBResult.score } ) ) } )
                         .catch(console.log);
                    }
                } )



            } )


        }
        else
        {
            response.send( JSON.stringify( {success : false} ) )
        }
    })
    .catch( () => response.send(JSON.stringify({success : false})) );





});

apiRouter.post("/task/getScoresForCurrentUser" , checkAuthMiddleware , (request : Request , response : Response) => {
    const {gradeBookNumber} = response.locals;

    UserDB.findOne( {
        where : {  gradeBookNumber },
        attributes : ["uid"]
    } )
    .then( userResult => {

        UserTaskPassedDB.findAll({
            where : { userId : userResult.uid },
            attributes : [ 'score' ]
        })
        .then( taskPassedResult => {
            let scoreSum = 0;
            for( const i of taskPassedResult ){
                scoreSum += i.score;
            }
            response.send( JSON.stringify( {scores : scoreSum } ) );
        } )


    } );


});


export default apiRouter;