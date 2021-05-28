import express, {RouterOptions , Request , Response, Router, response, NextFunction, request} from 'express';
import { UserDB , TaskDB , UserTaskPassedDB , TaskCategoryDB } from '../models';
import {v4 as uuidv4 , v5 as uuidv5} from 'uuid'
import { generateToken } from './api';

import multer from 'multer';

import crypto from 'crypto';
import * as fs from "fs";

const managerRouter  = express.Router();



interface AdminKeyStore{
    token : string,
    uuid : string,
    signUUID : string
}

interface ServerSideKeyStore {
    randomBytes : string,
    token : string,
    uuid : string
}

const AMDIN_LOGIN = "qwerty123qwerty321";
const ADMIN_PASSWORD = "2186621&text=pug";

const UPLOAD_DIR = "files/category"


const TASK_UPLOAD_DIR = "/public/files/tasks";
const CATEGORY_UPLOAD_DIR = "/public/files/categories";



if( !fs.existsSync(UPLOAD_DIR) )
{
    fs.mkdirSync(UPLOAD_DIR, {recursive : true});
}



const ADMIN_KEY_STORE : Map<string  , ServerSideKeyStore> = new Map<string , ServerSideKeyStore>();

function checkAdminAuthMiddleware( request : Request  , response : Response , next : NextFunction )
{
    const loginData = request.body



    next();


}

managerRouter.post( "/" , (request : Request , response : Response) => {
    const loginData = request.body;
    if( loginData.login === AMDIN_LOGIN && loginData.password === ADMIN_PASSWORD )
    {
        const adminData : ServerSideKeyStore = { token : '' ,  randomBytes : '' , uuid : '' };
        adminData.token = generateToken(16);
        adminData.uuid = uuidv4();
        adminData.randomBytes = crypto.randomBytes(16).toString("base64");
        const respData =
        {
            token : adminData.token,
            uuid : adminData.uuid,
            signUUID :  uuidv5(adminData.randomBytes , adminData.uuid)
        }
        ADMIN_KEY_STORE.set( AMDIN_LOGIN , adminData );
        response.send( respData );
    }
    else
    {
        response.send( JSON.stringify({ token : null , uuid : null , signUUID : null}) )
    }
} );

managerRouter.post("/checkAdminAuthData" , ( request : Request , response : Response ) => {
    const adminAuthData : AdminKeyStore = request.body?.authData;
    const serverSideAdminAuthData : ServerSideKeyStore = ADMIN_KEY_STORE.get( AMDIN_LOGIN ) ;
    if( serverSideAdminAuthData !== undefined )
    {
        const signUUID : string  =  uuidv5( serverSideAdminAuthData.randomBytes , serverSideAdminAuthData.uuid );
        if( serverSideAdminAuthData.token === adminAuthData?.token &&
            serverSideAdminAuthData.uuid === adminAuthData?.uuid &&
            signUUID === adminAuthData?.signUUID
        ){
            response.send( JSON.stringify( adminAuthData ) );

        }
        else{
            response.send( JSON.stringify({ token : null , uuid : null , signUUID : null}) );
        }
    }
    else
    {
        response.send( JSON.stringify({ token : null , uuid : null , signUUID : null}) );
    }
});

const taskCategoryStorageConfig = multer.diskStorage({
    destination : ( req , file , cb ) => {
        cb(null , "./public/files/categories/img")
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

managerRouter.post("/addTaskCategory"  ,taskCategoryUploader.fields([ { name : "titleImage" , maxCount : 1} ]), (request : Request , response : Response) => {
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
    ).then(result => response.send( JSON.stringify({ success : true }) ))
        .catch(err => response.send( JSON.stringify({ success : false }) ));
});

const taskStorageConfig = multer.diskStorage({
    destination : ( req , file , cb ) => {
        cb(null , "./public/files/tasks/tmp")
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

managerRouter.post("/addTask" , taskUploader.fields([ { name : "titleImage" , maxCount : 1} , {name : "taskFile" , maxCount:1} ]) , ( request : Request , response : Response ) => {
    if( request.files.length !== 0 ) {
        // @ts-ignore
        const titleImage : MulterFileInterface = request.files?.titleImage[0];
        // @ts-ignore
        const taskFile : MulterFileInterface = request.files?.taskFile[0];
        const { title , description , score , answer , categoryId }  = request.body;

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
            ).then( result => {  response.send(JSON.stringify({success : true})) ; console.log(result)} )
                .catch((err) => response.send(JSON.stringify({success : false})))
        }
        else
        {
            response.send(JSON.stringify({success : false}))
        }

    }
})

managerRouter.get("/getTaskCategories" , (request : Request  , response: Response) => {
    TaskCategoryDB.findAll( {attributes : ["uid" , "title"] })
        .then( result => {
            response.send( JSON.stringify(result) );
        });
})

managerRouter.get("/getTopUsers/:size" , (request : Request , respose : Response) => {
     const size =  +request.params?.size || 10;
     UserDB.findAll()
         .then(  async( result)  => {
             const topUsers = [];
             for(const user of result)
             {
                 const scoresArray  =   await  UserTaskPassedDB.findAll( { where : {userId : user.uid}, attributes : ["score"] } ) ;
                 // @ts-ignore
                 const scores : number = scoresArray.reduce(( a, b ) => a.score + b.score);

                 const { firstName , lastName , uid } = user
                 topUsers.push({ firstName , lastName , uid , scores })
             }
             topUsers.sort( (a , b) => a.scores - b.scores );
             response.send( JSON.stringify( topUsers.slice(0, size) ) );
         })
         .catch(err => response.send(err));
})




export default managerRouter;