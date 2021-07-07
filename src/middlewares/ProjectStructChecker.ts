import fs from 'fs';
import { UserTaskPassedDB , TaskCategoryDB , WrongAnswersDB , TaskDB , UserDB } from '../models';
import { v4 as uuidv4 } from "uuid";

async function createDefaultCategories()
{
    const DEFAULT_CATEGORIES = [
        'Joy' , 'Reverse' , 'Web', 'Linux' , 'Crypto' , 'Stegano'
    ];
    for( const category of DEFAULT_CATEGORIES)
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


    {
        TaskCategoryDB.create(
            {
                uid: uuidv4(),
                title: "Joy",
                description: "",
                shortName: "joy",
                titleImage: ''
            }
        );

        TaskCategoryDB.create(
            {
                uid: uuidv4(),
                title: "Reverse",
                description: "",
                shortName: "reverse",
                titleImage: ''
            }
        );

        TaskCategoryDB.create(
            {
                uid : uuidv4(),
                title : "Stegano",
                description : "",
                shortName : "stegano",
                titleImage : ''
            }
        );

        TaskCategoryDB.create(
            {
                uid : uuidv4(),
                title : "Crypto",
                description : "",
                shortName : "crypto",
                titleImage : ''
            }
        );

        TaskCategoryDB.create(
            {
                uid : uuidv4(),
                title : "Web",
                description : "",
                shortName : "web",
                titleImage : ''
            }
        )

        TaskCategoryDB.create(
            {
                uid : uuidv4(),
                title : "Linux",
                description : "",
                shortName : "linux",
                titleImage : ''
            }
        )


    }


}