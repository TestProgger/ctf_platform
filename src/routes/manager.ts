import express, { Request , Response,  NextFunction} from 'express';
import {
    UserDB,
    TaskDB,
    UserTaskPassedDB,
    TaskCategoryDB,
    WrongAnswersDB,
    UserScoresDB,
    TeamDB,
    UserToTeamLinkTable, TaskToTeamLinkTable, TeamScoresDB
} from '../models';
import {v4 as uuidv4 , v5 as uuidv5} from 'uuid'

import multer from 'multer';

import crypto from 'crypto';
import * as fs from "fs";
import {AdminKeyStore, ReportPassedTasksInterface, ServerSideKeyStore, UserDataInterface} from "./@types/manager";

import {Sequelize} from 'sequelize'
import UserScores from "../models/UserScores";


const managerRouter  = express.Router();

const AMDIN_LOGIN = "qwerty123qwerty321";
const ADMIN_PASSWORD = "qwerty123qwerty321";


const TASK_UPLOAD_DIR = "/public/tasks/";
const CATEGORY_UPLOAD_DIR = "/public/categories/";



const ADMIN_KEY_STORE : Map<string  , ServerSideKeyStore> = new Map<string , ServerSideKeyStore>();

function checkAdminAuthMiddleware( request : Request  , response : Response , next : NextFunction )
{
    const authData : AdminKeyStore= JSON.parse( Buffer.from( request.headers["x-auth-token"]  as string, "base64" ).toString("utf-8")  );
    const serverSideAuthData : ServerSideKeyStore = ADMIN_KEY_STORE.get( AMDIN_LOGIN ) ;

    if( serverSideAuthData !== undefined )
    {
        const signUUID : string  =  uuidv5( serverSideAuthData.randomBytes , serverSideAuthData.uuid );

        if( serverSideAuthData.token === authData?.token &&
            serverSideAuthData.uuid === authData?.uuid &&
            signUUID === authData?.signUUID
        ){
            next();
        }
        else{
            response.status(404).end();
        }
    }
    else
    {
        response.status(404).end();
    }
}

managerRouter.post('/' ,  checkAdminAuthMiddleware ,  ( request : Request , response : Response ) => {
    response.status(200).end();
});

managerRouter.post( "/login" , (request : Request , response : Response) => {
    const loginData = request.body;
    if( loginData.login === AMDIN_LOGIN && loginData.password === ADMIN_PASSWORD )
    {
        const adminData : ServerSideKeyStore = { token : '' ,  randomBytes : '' , uuid : '' };
        adminData.token = crypto.randomBytes(16).toString("hex");
        adminData.uuid = uuidv4();
        adminData.randomBytes = crypto.randomBytes(16).toString("base64");
        const respData =
        {
            token : adminData.token,
            uuid : adminData.uuid,
            signUUID :  uuidv5(adminData.randomBytes , adminData.uuid)
        }
        ADMIN_KEY_STORE.set( AMDIN_LOGIN , adminData );
        response.json( respData );
    }
    else
    {
        response.status(404).end();
    }
} );

const taskCategoryStorageConfig = multer.diskStorage({
    destination : ( req , file , cb ) => {
        cb(null , "./public/categories/img")
    },
    filename: (req, file, cb) => {
        cb(null , file.originalname.split(".")[0] + "." + crypto.randomBytes(4).toString("hex") + "." + file.originalname.split(".").pop() );
    }
})
const taskCategoryUploader = multer({storage :  taskCategoryStorageConfig});

interface MulterFileInterface{
    fieldname : string,
    originalname : string,
    encoding : string,
    mimetype : string,
    destination : string,
    filename : string ,
    path : string ,
    size : number

}

managerRouter.post("/addTaskCategory"  , checkAdminAuthMiddleware , taskCategoryUploader.fields([ { name : "titleImage" , maxCount : 1} ]), (request : Request , response : Response) => {
    const {title, description, shortName} = request.body;

    // @ts-ignore
    const titleImage : MulterFileInterface = request.files?.titleImage[0];
    TaskCategoryDB.create(
        {
            uid : uuidv4(),
            title,
            description,
            titleImage: CATEGORY_UPLOAD_DIR + "/img/" + titleImage.filename,
            shortName
        }
    ).then(result => response.json( { success : true } ))
        .catch(err => response.json( { success : false } ));
});

const taskStorageConfig = multer.diskStorage({
    destination : ( req , file , cb ) => {
        cb(null , "./public/tasks/tmp")
    },
    filename: (req, file, cb) => {
        cb(null , file.originalname.split(".")[0] + "." + crypto.randomBytes(8).toString("hex") + "." + file.originalname.split(".").pop() );
    }
})
const taskUploader = multer({storage :  taskStorageConfig});

interface MulterFileInterface{
    fieldname : string,
    originalname : string,
    encoding : string,
    mimetype : string,
    destination : string,
    filename : string ,
    path : string ,
    size : number

}

managerRouter.post("/addTask" , checkAdminAuthMiddleware  ,taskUploader.fields([ { name : "titleImage" , maxCount : 1} , {name : "taskFile" , maxCount:1} ]) , async ( request : Request , response : Response ) => {

    const { title , description , score , answer , categoryId }  = request.body;
    // @ts-ignore
    const titleImage = request.files?.titleImage ? request.files.titleImage[0]  : null;
    // @ts-ignore
    const taskFile = request.files?.taskFile ? request.files?.taskFile[0] : null;

    try{
        await TaskDB.create(
            {
                uid : uuidv4(),
                        title,
                        description ,
                        score,
                        answer,
                        titleImage : titleImage ? TASK_UPLOAD_DIR + "/img/" + titleImage.filename : null,
                        filePath : taskFile ? TASK_UPLOAD_DIR + "/taskFiles/" +taskFile.filename  :  null,
                        categoryId,
            }
        )

        if( titleImage !== null )
        {
            fs.writeFileSync( "."+TASK_UPLOAD_DIR + "/img/" + titleImage.filename , fs.readFileSync(titleImage.path ) );
            fs.unlinkSync( titleImage.path );
        }

        if(taskFile !== null)
        {
            fs.writeFileSync( "."+TASK_UPLOAD_DIR + "/taskFiles/" + taskFile.filename , fs.readFileSync(taskFile.path));
            fs.unlinkSync( taskFile.path);
        }

        response.json({success :  true});
    }
    catch(e)
    {
        response.json({success :  false});
    }

})

managerRouter.get("/getTaskCategories" , checkAdminAuthMiddleware ,  (request : Request  , response: Response) => {
    TaskCategoryDB.findAll( {attributes : ["uid" , "title"] })
        .then( result => {
            response.json( result );
        })
        .catch( _ => response.json([]) );
})

managerRouter.get( "/getTasks" , checkAdminAuthMiddleware , ( request : Request , response : Response ) => {
    TaskDB.findAll( {
        attributes : [ "uid" , "title" ]
    } )
    .then(result => {
        response.json(result)
    })
    .catch( _ => response.json([]) );

} );


managerRouter.get( "/getTopHackers" , checkAdminAuthMiddleware , ( request : Request , response : Response ) => {
    const numHackers : number = +request.query.q || 10;
    UserScoresDB.findAll({
            limit : numHackers,
            order : Sequelize.literal("scores DESC"),
        }
    ).then( async ( usResult )  => {
        const responseData = [];
        if(usResult.length){
            for( const user of usResult ){
                const numSuccessAttempts = await UserTaskPassedDB.count({ where : { userId : user.uid } });
                const numWrongAttempts = await WrongAnswersDB.count( { where : { userId: user.userId } } );
                const { uid , firstName , lastName } = await UserDB.findOne({where : { uid : user.userId } , attributes : ['uid' , 'firstName' , 'lastName']});
                responseData.push({ uid , firstName , lastName , scores : user.scores , numWrongAttempts , numSuccessAttempts   })
            }
        }
        response.json( responseData );
    }).catch(console.log)
} );


managerRouter.get("/getDataPassedTasksByCategory" , checkAdminAuthMiddleware , ( request : Request , response : Response ) => {
    TaskCategoryDB.findAll( { attributes : ['uid' , "title"] } )
        .then( async( taskCategories)  => {
            const respData = [];
            for( const taskCategory of taskCategories )
            {
                const numOfPassedTasks  = await UserTaskPassedDB.count({ where : { categoryId : taskCategory.uid } });
                respData.push( { categoryName : taskCategory.title , numOfPassedTasks  } );
            }
            respData.sort( ( a , b ) => b.numOfPassedTasks - a.numOfPassedTasks );
            response.json( respData );

        } )
});

managerRouter.get("/getUserStat" , checkAdminAuthMiddleware , async ( request : Request , response : Response ) => {
    try{
        const gradeBookNumber = request.query.gbn;
        const userId = (await UserDB.findOne( { where : { gradeBookNumber } , attributes : ['uid'] }  )).uid;

        const taskCategories = await TaskCategoryDB.findAll({  attributes : [ 'uid' , 'title' ] });
        const passedTasksStat = [];
        for( const taskCategory of taskCategories )
        {
            passedTasksStat.push(
                { categoryName  : taskCategory.title , numOfPassedTasks : await UserTaskPassedDB.count( { where : {userId , categoryId: taskCategory.uid} } )  }
            );
        }

        const userData = await  UserDB.findOne( { where : { uid : userId } , attributes : ['firstName' , 'lastName' , 'gradeBookNumber'] }  );

        response.json( {
            passedTasksStat : passedTasksStat.filter(( item ) => item.numOfPassedTasks).sort((a,b) => b.numOfPassedTasks -a.numOfPassedTasks),
            firstName :  userData.firstName,
            lastName :  userData.lastName,
            gradeBookNumber : userData.gradeBookNumber,
        } )
    }
    catch (e) {
        response.json(null);
    }
});


managerRouter.post("/createUser" , checkAdminAuthMiddleware , async (request : Request , response : Response) => {
    try{
        const { firstName  , lastName , gradeBookNumber  , password } = request.body;


        const sha256 = crypto.createHash('sha256');
        sha256.update( password );

        const [ user , created ] = await UserDB.findOrCreate(
            {
                where : {gradeBookNumber , deleted :  false},
                defaults : {
                    uid : uuidv4(),
                    firstName,
                    lastName,
                    gradeBookNumber,
                    password : sha256.digest('hex'),
                    secretToken : crypto.randomBytes(64).toString("base64")
                }
            }
        );
        sha256.end();
        response.json(
            created ? user.uid : { error : "A user with this grade book number already exists" }
        )
    } catch (e) {
        console.log(e);
        response.json(null);
    }
});

managerRouter.post("/destroyUsers" , checkAdminAuthMiddleware , async (request : Request , response : Response) => {
    try{
        const { uids } = request.body;
        for(const uid of uids){
            await UserDB.update( { deleted : true} ,  { where : { uid } }  );
            await UserToTeamLinkTable.destroy( { where : {userId : uid} } );
        }
        response.json({success : true});
    } catch (e) {
        response.json({success : false});
    }
});


managerRouter.get("/getUsers" , checkAdminAuthMiddleware , async (request : Request , response : Response ) => {
    try{
        const users = await UserDB.findAll( { where : { deleted :  false } , attributes : ["uid" , "firstName" , "lastName"] } );
        response.json(users);
    }catch (e) {
        response.json([]);
    }
});


managerRouter.post("/createTeam" , checkAdminAuthMiddleware , async (request : Request , response  : Response) => {
    try{
        const { teamName , users } = request.body;
        const team  = await  TeamDB.create( { uid : uuidv4() , title : teamName } );



        const userPassedTasks : any[] = []

        for( const user of users)
        {
            userPassedTasks.push( ...(await UserTaskPassedDB.findAll( { where : { userId : user } } )) );

            await UserToTeamLinkTable.create(
                {
                    uid : uuidv4(),
                    teamId : team.uid,
                    userId : user
                }
            )
        }
        response.json(team.uid);

        const passedTasksSet = Array.from( new Set( userPassedTasks ) );
        let scores : number  = 0;
        for( const upt of passedTasksSet ){
            await  TaskToTeamLinkTable.create(  { taskId : upt.taskId , teamId : team.uid , uid : uuidv4() }  );
            scores += ( await TaskDB.findOne( { where : {uid : upt.taskId} } ) ).score ;
        }
        await TeamScoresDB.create({ uid : uuidv4() , teamId : team.uid , scores });
    }
    catch (e) {
        response.json(null);
    }
});

managerRouter.post("/destroyTeam" , checkAdminAuthMiddleware , async (request : Request , response  : Response) => {
    try{
        const { uids , fullDestroy } = request.body;
        for( const uid of uids){
            if(fullDestroy){
                await TeamDB.destroy({ where : {uid} });
                await TaskToTeamLinkTable.destroy( { where : {teamId : uid }});
                await TeamScoresDB.destroy({ where : { teamId: uid } });
            }else
            {
                await  TeamDB.update( { deleted : true } , { where : {uid} } );
            }
            await UserToTeamLinkTable.destroy({ where : { teamId : uid } });
        }

        response.json(uids)
    }
    catch (e) {
        response.json(null);
    }
});

managerRouter.get("/getTeams" , checkAdminAuthMiddleware , async (request : Request , response  : Response) => {
    try{
        const teams  = await TeamDB.findAll({ where : { deleted : false } , attributes : ['uid' , 'title']});
        response.json(teams);
    }catch (e) {
        response.json([]);
    }
})

managerRouter.get("/getReportForPassedTasks"  , async( request : Request , response :  Response ) => {
    try{
        const teams = await TeamDB.findAll({ attributes : ['uid' , 'title']  , where : {deleted :  false}});
        let userToTeam = await  UserToTeamLinkTable.findAll({ attributes : ["teamId" , "userId"] });
        let users = await UserDB.findAll( { attributes : [ "uid" , "firstName" , "lastName" ] } );
        let usersScores = await  UserScoresDB.findAll();

        const resp :  ReportPassedTasksInterface[] = [];

        for(const team of teams){
            const tmpUsersToTeam = userToTeam.filter(item  => item.teamId === team.uid ).map( item => item.userId );
            const tmpUsers = users.filter(user  => tmpUsersToTeam.includes(user.uid));
            const tmpUsersScores = usersScores.filter( score => tmpUsersToTeam.includes(score.userId) );

            const mList : UserDataInterface[]  = [];

            for( const user of tmpUsers ){
                mList.push(
                    {
                        firstName : user.firstName,
                        lastName : user.lastName,
                        scores : tmpUsersScores.filter( score => score.userId === user.uid)[0].scores
                    }
                )
            }
            resp.push({
                teamName : team.title,
                sumScores : (await TeamScoresDB.findOne({ where: {  teamId : team.uid } , attributes : ["scores"] })).scores,
                users : mList
            });

            usersScores = usersScores.filter( score => !tmpUsersToTeam.includes(score.userId) );
            users = users.filter( user => !tmpUsersToTeam.includes(user.uid) );
            userToTeam = userToTeam.filter( user => !tmpUsersToTeam.includes(user.userId) );
        }

        response.json(resp);
    } catch (e) {
        response.json([]);
    }
});


managerRouter.get( "/getFreeUsers" , checkAdminAuthMiddleware , async (request : Request , response : Response) => {
    try{
        const usersToTeam =  ( await UserToTeamLinkTable.findAll( {attributes : ['userId'] } ) ).map(item => item.userId);
        const users = await UserDB.findAll({ attributes : ['uid' , 'firstName' , 'lastName'] , where : {deleted : false} });
        const diff = users.filter( item => usersToTeam.indexOf(item.uid) === -1  );
        response.json(diff);
    }catch (e) {
        response.json([]);
    }
});

export default managerRouter;
