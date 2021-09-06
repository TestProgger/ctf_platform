import express, { Request , Response, Router,  NextFunction} from 'express';
import {
    UserDB,
    TaskDB,
    UserTaskPassedDB,
    TaskCategoryDB,
    WrongAnswersDB,
    UserScoresDB,
    TaskToTeamLinkTable, UserToTeamLinkTable, TeamScoresDB, TeamDB
} from '../models';




import {v4 as uuidv4 , v5 as uuidv5} from 'uuid';

import crypto  from 'crypto';
import * as bcrypt from 'bcrypt';
import {
    BrowserFingerprintInterface,
    RequestLoginType,
    RequestRegisterErrorType,
    RequestRegisterType,
    SessionUserAuthData
} from "./@types/api";

import * as winston from 'winston';

import { BOT } from '../bot';


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

interface  ExtendedResponse extends Response{
    user ?: any
}

export async function checkAuthMiddleware( request : Request , response : ExtendedResponse , next : NextFunction):Promise<any>
{
    const authData : SessionUserAuthData = JSON.parse( Buffer.from( request.headers["x-auth-token"]  as string, "base64" ).toString("utf-8")  );
    const suspFingerprint = {
        browserFingerprint :  JSON.parse( Buffer.from( request.headers["x-finger-data"]  as string, "base64" ).toString("utf-8")  ),
        userAgent : request.headers["user-agent"],
        userIp :  request.ip
    }

    if( authData?.gradeBookNumber ){

        response.locals.gradeBookNumber = authData?.gradeBookNumber;
        response.user = await UserDB.findOne( { where : { gradeBookNumber : authData ?.gradeBookNumber } } );
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

            await UserDB.create( {
                    uid :  uuidv4(),
                    gradeBookNumber : userData.gradeBookNumber,
                    firstName :  userData.firstName,
                    lastName : userData.lastName,
                    password : await bcrypt.hash(userData.password , 10),
                    secretToken  : crypto.randomBytes(64).toString("base64")
            });
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
            const isValid = await bcrypt.compare( userData.password , user.password  );
            if ( isValid ){
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

        }else
        {
            response.json({ authorized : false } );
        }
    }catch(e){
        response.json({ authorized : false } );
    }


});

apiRouter.post("/taskCategories/:category" , checkAuthMiddleware , async (request : Request , response:ExtendedResponse) => {
    try {

        const taskCategory = await TaskCategoryDB.findOne({ where : { shortName : request.params.category }});

        if( taskCategory !== null )
        {
            const tasks = await TaskDB.findAll({
                            where : { categoryId : taskCategory.uid },
                            attributes : ['uid' , 'title' , "categoryId" , "description" , "filePath" , "titleImage" , "score"]
            });
            const userId   = response.user.uid;

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

apiRouter.post("/task/checkTaskAnswer" , checkAuthMiddleware , async (request:Request , response:ExtendedResponse) => {

    interface AnswerDataInterface{
        answer : string,
        taskId : string
    }

    const { answer  , taskId  } : AnswerDataInterface = request.body;
    try{
        const task = await TaskDB.findOne( {
            where : {uid : taskId},
            attributes : [ "answer" , "score" , "categoryId" , "title" ]
        } );

        const userId = response.user.uid;

        if( task.answer.toLowerCase() === answer.toLowerCase() )
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

                const {allTasksPassed}  = await checkCTFComplete(response);

                response.json({ success : true , score : task.score , allTasksPassed } );

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
                    } ).catch(winston.error);
                    const team = await TeamDB.findOne({ where : { uid : userToTeam.teamId} });
                    BOT.sendMessage(  process.env.CHAT_ID ,
                        `🥳 Task Passed\n😇 User : ${response.user.firstName} ${response.user.lastName}\n👫 Team : ${team.title}\n👾 Task : ${task.title}`
                        );

                    TeamScoresDB.findOne( {
                        where : {uid : userToTeam.teamId},
                    } ).then( tsResult => {
                        if( tsResult?.scores  )
                        {
                            tsResult.update({    scores : tsResult.scores +  task.score }).catch(winston.error);
                        }
                        else
                        {
                            TeamScoresDB.create( { teamId : userToTeam.teamId , scores : task.score , uid : uuidv4() } ).catch(winston.error);
                        }
                    }).catch(winston.error);
                }else{
                    BOT.sendMessage(  process.env.CHAT_ID ,
                        `🥳 Task Passed\n😇 User : ${response.user.firstName} ${response.user.lastName}\n👾 Task : ${task.title}`
                        );
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
                        }).catch(winston.error);
                    }
                    else
                    {
                        UserScoresDB.create(
                            {
                                uid : uuidv4(),
                                userId ,
                                scores : task.score
                            }
                        ).catch(winston.error);
                    }
                } ).catch(winston.error);


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
                .catch(winston.error);
        }

    }catch(e){
        console.log(e);
        response.json({success : false})
    }
});

apiRouter.get("/task/getScoresForCurrentUser" , checkAuthMiddleware , async (request : Request , response : ExtendedResponse) => {
    const userId   = response.user?.uid;
    try{
        const scores = await UserScoresDB.findOne({ where : {userId}  , attributes : ["scores"]});
        response.json( {  scores  : scores.scores || 0 });
    }catch(ex)
    {
        response.json({scores : 0});
    }

});

let TEAMS_WHO_PASSED_TASKS : string[] = [];
// let USERS_WHO_PASSED_TASKS : string[] = [];
async function checkCTFComplete( response : ExtendedResponse )
{
    const isTeamComplete = await checkTeamCtfComplete( response );
    const isUserComplete = await checkUserCtfComplete( response );
    return { allTasksPassed :  isUserComplete  || isTeamComplete };
}


let USERS_WHO_PASSED_TASKS : string[] = [];
async function checkUserCtfComplete( response : ExtendedResponse )
{

    try{
        const { user } = response;

        const passedTasksCount = await UserTaskPassedDB.count( { where  : { userId : user.uid }} );
        const tasksCount = await TaskDB.count( { where : { required  : true } });

        if( passedTasksCount === tasksCount && tasksCount !== 0 )
        {
            if( !USERS_WHO_PASSED_TASKS.includes( user.uid ) )
            {
                USERS_WHO_PASSED_TASKS.push( user.uid );
                const date = new Date();
                BOT.sendMessage(process.env.CHAT_ID ,
                    `✅ All Required Tasks Passed\n✅ User : ${ user.firstname } ${user.lastName}\n✅ Time : ${date.toLocaleString('ru')}`
                );
            }
        }
        else if( USERS_WHO_PASSED_TASKS.includes( user.uid ) )
        {
                USERS_WHO_PASSED_TASKS = USERS_WHO_PASSED_TASKS.filter( uid => uid !== user.uid );
        }

        return USERS_WHO_PASSED_TASKS.includes(user.uid)  ;
    }catch(ex)
    {
        winston.error( ex );
        return false;
    }
    
}


async function checkTeamCtfComplete(response : ExtendedResponse)
{
    try{
        const { user } = response;
        const userToTeam = await UserToTeamLinkTable.findOne( { where : { userId : user.uid  } , attributes : ["teamId"] } );
        const tasksCount = await TaskDB.count( { where : { required  : true } });
        const team = await TeamDB.findOne( { where : { uid : userToTeam.teamId } } );
        if( userToTeam ){
            const teamTasksCount = await TaskToTeamLinkTable.count({ where : { teamId :  userToTeam.teamId } });
            if ( teamTasksCount === tasksCount && tasksCount !== 0 )
            {
                if ( !TEAMS_WHO_PASSED_TASKS.includes(userToTeam.teamId) ){
                    TEAMS_WHO_PASSED_TASKS.push( team.uid )
                    const date = new Date();
                    BOT.sendMessage(process.env.CHAT_ID ,
                        `✅ All Required Tasks Passed\n✅ Team : ${ team.title }\n✅ Time : ${date.toLocaleString('ru')}`
                    );
                }
            }
            else if( TEAMS_WHO_PASSED_TASKS.includes( team.uid ) ){
                TEAMS_WHO_PASSED_TASKS = TEAMS_WHO_PASSED_TASKS.filter( uid => uid !== team.uid  );
            }
        }

        return  TEAMS_WHO_PASSED_TASKS.includes(team.uid)  ;
    }catch(ex){
        winston.error(ex);
        return false;
    }
    
}



apiRouter.get("/allRequiredTasksPassed"  , checkAuthMiddleware , async( request : Request , response : ExtendedResponse ) => {
    response.json( await checkCTFComplete( response ) );
})

export default apiRouter;
