import {Sequelize} from 'sequelize';

import Task from './Task';
import User from './User';
import UserTaskPassed from './UserTaskPassed';
import TaskCategory  from './TaskCategory'
import WrongAnswers from "./WrongAnswers";
import Team from "./Team";
import UserScores from "./UserScores";
import TeamScores from "./TeamScores";

// Link Tables
import UserToTeam_lt from "./lt/UserToTeam_lt";
import TaskToTeam_lt from "./lt/TaskToTeam_lt";


export const sequelize  = new Sequelize("sqlite:./dbs/ctf_simple_db.db" ,
    {
        logging : false ,
        pool : {
            max : 10
        }
    });

/* Config for PostgreSQL
export const sequelize = new Sequelize(
    {
        database : "database",
        username : "username",
        password : "password",
        host : "host",
        port : 5432,
        dialect : 'postgres',
        logging : false,
        pool : {
            max :  20
        }
    }
)
*/


export const TaskDB = Task(sequelize);
export const UserDB = User(sequelize);
export const UserTaskPassedDB = UserTaskPassed(sequelize);
export const TaskCategoryDB = TaskCategory(sequelize);
export const WrongAnswersDB = WrongAnswers(sequelize);
export const TeamDB = Team(sequelize);
export const UserScoresDB = UserScores(sequelize);
export const TeamScoresDB = TeamScores(sequelize);

// Link Tables
export const UserToTeamLinkTable = UserToTeam_lt(sequelize);
export const TaskToTeamLinkTable = TaskToTeam_lt(sequelize);




