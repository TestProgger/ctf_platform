import express, { Request , Response,  NextFunction} from 'express';
import {
    UserDB,
    TaskDB,
    UserTaskPassedDB,
    TaskCategoryDB,
    WrongAnswersDB,
    UserScoresDB,
    TeamDB,
    UserToTeamLinkTable
} from '../models';
import {v4 as uuidv4 , v5 as uuidv5} from 'uuid'

import multer from 'multer';

import crypto from 'crypto';
import * as fs from "fs";
import {AdminKeyStore, ServerSideKeyStore} from "./@types/manager";

import {Sequelize} from 'sequelize'
import {readdirSync} from "fs";
import User from "../models/User";


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

managerRouter.post("/addTask" , checkAdminAuthMiddleware  ,taskUploader.fields([ { name : "titleImage" , maxCount : 1} , {name : "taskFile" , maxCount:1} ]) , ( request : Request , response : Response ) => {

    const { title , description , score , answer , categoryId }  = request.body;
    // @ts-ignore
    if( request.files?.titleImage && request.files?.taskFile ) {
         // @ts-ignore
        const titleImage : MulterFileInterface = request.files.titleImage[0];
         // @ts-ignore
        const taskFile : MulterFileInterface = request.files?.taskFile[0];

        if( titleImage && taskFile ){
            fs.writeFileSync( "."+TASK_UPLOAD_DIR + "/img/" + titleImage.filename , fs.readFileSync(titleImage.path ) );
            fs.unlinkSync( titleImage.path );
            fs.writeFileSync( "."+TASK_UPLOAD_DIR + "/taskFiles/" + taskFile.filename , fs.readFileSync(taskFile.path));
            fs.unlinkSync( taskFile.path);

            TaskDB.create(
                {
                    uid : uuidv4(),
                    title,
                    description ,
                    score,
                    answer,
                    titleImage : TASK_UPLOAD_DIR + "/img/" + titleImage.filename,
                    filePath : TASK_UPLOAD_DIR + "/taskFiles/" + taskFile.filename ,
                    categoryId,
                }
            ).then( result => {  response.json({success : true}) } )
                .catch((err) => response.json({success : false}))
        }
        else
        {
            response.json({success : false})
        }
    }
    else
    {
        TaskDB.create(
            {
                uid : uuidv4(),
                title,
                description ,
                score,
                answer,
                categoryId,
                titleImage : null,
                filePath : null ,
            }
        ).then( result => {  response.json({success : true})} )
            .catch((err) => response.json({success : false}))
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


        const [ user , created ] = await UserDB.findOrCreate(
            {
                where : {gradeBookNumber},
                defaults : {
                    uid : uuidv4(),
                    firstName,
                    lastName,
                    gradeBookNumber,
                    password,
                    uuid : uuidv4(),
                    secretToken : crypto.randomBytes(64).toString("base64")
                }
            }
        );
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



managerRouter.post("/createTeam" , checkAdminAuthMiddleware , async (request : Request , response  : Response) => {
    try{
        const { teamName , users } = request.body;
        const team  = await  TeamDB.create( { uid : uuidv4() , title : teamName } );
        for( const user of users)
        {
            await UserToTeamLinkTable.create(
                {
                    uid : uuidv4(),
                    teamId : team.uid,
                    userId : user
                }
            )
        }
        response.json(team.uid);
    }
    catch (e) {
        response.json(null);
    }
});

managerRouter.post("/destroyTeam" , checkAdminAuthMiddleware , async (request : Request , response  : Response) => {
    try{
        const { uid } = request.body;
        await  TeamDB.update( { deleted : true } , { where : {uid} } );
        UserToTeamLinkTable.destroy({ where : { teamId : uid } });
        response.json(uid)
    }
    catch (e) {
        response.json(null);
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