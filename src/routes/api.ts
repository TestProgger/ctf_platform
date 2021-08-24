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
    try{
        const users = await UserDB.findAll({where : { gradeBookNumber : userData.gradeBookNumber , deleted :  false }});
        if( !users.length )
        {
            const sha256 = crypto.createHash("sha256");
            sha256.update( userData.password );

            await UserDB.create( {
                    uid :  uuidv4(),
                    gradeBookNumber : userData.gradeBookNumber,
                    firstName :  userData.firstName,
                    lastName : userData.lastName,
                    password : sha256.digest("hex"),
                    secretToken  : crypto.randomBytes(64).toString("base64")
            })
            sha256.end();
            response.json({ success : true });
        }else{
            response.json( { success : false , errorText : "The user is already registered" } )
        }
    }
    catch(e){
        response.json({ success : false  , errorText : "Save error"});
    }


});

apiRouter.post("/login" , async (request : Request , response : Response) => {
    const userData : RequestLoginType = request.body;

    const browserFingerprint :BrowserFingerprintInterface = JSON.parse( Buffer.from( request.headers["x-finger-data"]  as string, "base64" ).toString("utf-8")  );
    const userAgent : string  = request.headers["user-agent"];
    const userIp : string = request.ip;

    try{
        const user = await UserDB.findOne( {  where : { gradeBookNumber : userData.gradeBookNumber , deleted : false }} );
        if ( user !== null )
        {
            const sha256 = crypto.createHash('sha256');
            sha256.update(userData.password);

            if ( user.password === sha256.digest('hex') ){
                const sessionData : SessionUserAuthData = { token : '' , uuid : '' , gradeBookNumber : userData.gradeBookNumber , userId : user.uid };

                sessionData.token = crypto.randomBytes(32).toString("hex");
                sessionData.uuid = uuidv5(user.secretToken , uuidv4() ) ;
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
            }else{
                response.json( { authorized : false } );
            }
            sha256.end();
        }else
        {
            response.json({ authorized : false } );
        }
    }catch(e){
        response.json({ authorized : false } );
    }


});

apiRouter.post("/taskCategories/:category" , checkAuthMiddleware , async (request : Request , response:Response) => {
    try {

        const taskCategory = await TaskCategoryDB.findOne({ where : { shortName : request.params.category }});

        if( taskCategory !== null )
        {
            const tasks = await TaskDB.findAll({
                            where : { categoryId : taskCategory.uid },
                            attributes : ['uid' , 'title' , "categoryId" , "description" , "filePath" , "titleImage" , "score"]
            });
            const { userId }  = TEMPORARY_KEY_STORAGE.get( response.locals.gradeBookNumber );

            const passedTasks = ( await UserTaskPassedDB.findAll({ where : { userId },attributes : ['taskId']})).map( item  => item.taskId );

            const resp = []
            for( const task of tasks )
            {
                const tmp = { ...task , passed : false }
                if(  passedTasks.includes( task.uid )  )
                {
                    tmp.passed = true
                }
                resp.push( tmp );
            }

            response.json(resp);

        }else
        {
            response.json([]);
        }
    }catch (ex)
    {
        response.json( [] );
    }
});


apiRouter.post("/taskCategories" , checkAuthMiddleware  ,  async ( request : Request , response : Response ) => {
    try{
        response.json(await TaskCategoryDB.findAll());
    }catch{
        response.json({});
    }

} );

apiRouter.post("/task/checkTaskAnswer" , checkAuthMiddleware , async (request:Request , response:Response) => {

    interface AnswerDataInterface{
        answer : string,
        taskId : string
    }

    const { answer  , taskId  } : AnswerDataInterface = request.body;
    try{
        const task = await TaskDB.findOne( {
            where : {uid : taskId},
            attributes : [ "answer" , "score" , "categoryId" ]
        } );

        const { gradeBookNumber } = response.locals;
        const { userId } = TEMPORARY_KEY_STORAGE.get( gradeBookNumber );

        if( task.answer === answer )
        {
            const passedTasks = await UserTaskPassedDB.findAll( {
                where : { taskId  ,  userId } ,
                attributes : [ 'uid' ] }
            );

            if( passedTasks.length ){
                response.json(  { success : true , score : 0 }  );
            }
            else
            {
                await UserTaskPassedDB.create(
                    {
                        uid : uuidv4(),
                        taskId ,
                        userId,
                        categoryId : task.categoryId,
                    }
                 );

                 response.json({ success : true , score : task.score } )

                const userToTeam = await UserToTeamLinkTable.findOne(
                    {
                        where : {userId},
                        attributes: ['teamId']
                    }
                );

                if( userToTeam !== null )
                {
                    TaskToTeamLinkTable.create( {
                        uid : uuidv4(),
                        teamId : userToTeam.teamId ,
                        taskId
                    } ).catch(console.log);

                    TeamScoresDB.findOne( {
                        where : {uid : userToTeam.teamId},
                    } ).then( tsResult => {
                        if( tsResult?.scores  )
                        {
                            tsResult.update({    scores : tsResult.scores +  task.score }).catch(console.log);
                        }
                        else
                        {
                            TeamScoresDB.create( { teamId : userToTeam.teamId , scores : task.score , uid : uuidv4() } ).catch(console.log);
                        }
                    }).catch(console.log);
                }

                UserScoresDB.findOne(
                    {
                        where : { userId }
                    }
                ).then( userScoresResult => {
                    if ( userScoresResult?.userId )
                    {
                        UserScoresDB.update({ scores : userScoresResult.scores + task.score } , {
                            where : {userId}
                        }).catch(console.log);
                    }
                    else
                    {
                        UserScoresDB.create(
                            {
                                uid : uuidv4(),
                                userId ,
                                scores : task.score
                            }
                        ).catch(console.log);
                    }
                } ).catch(console.log);


            }
        }else
        {
            response.json(  {success : false}  )
            WrongAnswersDB.create(
                {
                    uid : uuidv4(),
                    userId,
                    taskId ,
                    categoryId : task.categoryId,
                    answer
                }
            )
                .catch(console.log);
        }

    }catch(e){
        response.json({success : false})
    }
});

apiRouter.post("/task/getScoresForCurrentUser" , checkAuthMiddleware , async (request : Request , response : Response) => {
    const {gradeBookNumber} = response.locals;
    const { userId }  = TEMPORARY_KEY_STORAGE.get( gradeBookNumber );
    const scores = ( await UserScoresDB.findOne({ where : {userId}  , attributes : ["scores"]}) ).scores || 0;
    response.json( { scores });
});


export default apiRouter;