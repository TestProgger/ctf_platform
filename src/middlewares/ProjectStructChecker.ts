import fs from 'fs';
import { UserTaskPassedDB , TaskCategoryDB , WrongAnswersDB , TaskDB , UserDB , TeamDB , UserScoresDB , TeamScoresDB } from '../models';
import { TaskToTeamLinkTable , UserToTeamLinkTable } from '../models';
import { v4 as uuidv4 } from "uuid";

async function createDefaultCategories()
{
    const DEFAULT_CATEGORIES = [
        'Joy' , 'Reverse' , 'Web', 'Linux' , 'Crypto' , 'Stegano'
    ];
    for( const category of DEFAULT_CATEGORIES)
    {
        const cnt = await TaskCategoryDB.count({where : { title : category , shortName : category.toLowerCase() }});
        if( !cnt )
        {
            await TaskCategoryDB.create(
                {
                    uid : uuidv4(),
                    title : category,
                    description : '',
                    shortName : category.toLowerCase(),
                    titleImage : ''
                }
            );
        }
    }
}

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
    TaskCategoryDB.sync().then(createDefaultCategories);
    TaskDB.sync();
    UserTaskPassedDB.sync();
    WrongAnswersDB.sync();
    TeamDB.sync();
    UserScoresDB.sync();
    TeamScoresDB.sync();

    // Link
    TaskToTeamLinkTable.sync();
    UserToTeamLinkTable.sync();



}