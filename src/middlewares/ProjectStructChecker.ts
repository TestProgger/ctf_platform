import fs from 'fs';
import { UserTaskPassedDB , TaskCategoryDB , WrongAnswersDB , TaskDB , UserDB } from '../models';

export const ProjectStructChecker = () => {

    fs.access( "./logging" , (err) => {

        if( err )
        {
            fs.mkdir( "./logging" , ( err ) => err );
        }

    } );

    fs.access( "./dbs" , (err) => {
        if(  err ) {
            fs.mkdir("./dbs" , (err) => err);
        }
    } )


    fs.access("./public" , (err) => {
        if( err )
        {
            fs.mkdirSync( "./public");
            fs.mkdirSync("./public/categories/img/", {recursive : true});
            fs.mkdirSync('./public/tasks/img' , {recursive : true});
            fs.mkdirSync('./public/tasks/tmp' , {recursive : true});
            fs.mkdirSync('./public/tasks/taskFiles' , {recursive : true});
        }
    });

    UserDB.sync();
    TaskCategoryDB.sync();
    TaskDB.sync();
    UserTaskPassedDB.sync();
    WrongAnswersDB.sync();
}