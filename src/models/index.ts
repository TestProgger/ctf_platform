import {Sequelize} from 'sequelize';

import Task from './Task';
import User from './User';
import UserTaskPassed from './UserTaskPassed';
import TaskCategory  from './TaskCategory'


export const sequelize  = new Sequelize("sqlite:./dbs/ctf_simple_db.db");
export const TaskDB = Task(sequelize);
export const UserDB = User(sequelize);
export const UserTaskPassedDB = UserTaskPassed(sequelize);
export const TaskCategoryDB = TaskCategory(sequelize);



