import express, { Request , Response, Router, response, NextFunction} from 'express';
import { UserDB , TaskDB , UserTaskPassedDB , TaskCategoryDB } from '../models';
import {v4 as uuidv4 , v5 as uuidv5} from 'uuid'
import { checkAuthMiddleware, generateToken } from './api';

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
            // console.log( authData , serverSideAuthData , signUUID );
            next();
        }
        else{
            response.json( { token : null , uuid : null , signUUID : null} );
        }
    }
    else
    {
        response.json( { token : null , uuid : null , signUUID : null} );
    }
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
        response.json( respData );
    }
    else
    {
        response.json( { token : null , uuid : null , signUUID : null} );
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

managerRouter.get( "/getTasks" , checkAuthMiddleware , ( request : Request , response : Response ) => {

    console.table([ 1, 2,3,4 ])

    TaskDB.findAll( {
        attributes : [ "uid" , "title" ]
    } )
    .then(result => {
        response.json(result)
    })
    .catch( _ => response.json([]) );

} );

export default managerRouter;