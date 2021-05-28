import Sequelize, {Model, Optional} from 'sequelize';

import TaskCategory from './TaskCategory';

interface TaskInterface{
    uid : string
    title : string
    description : string
    score : number
    answer : string
    titleImage : string
    filePath : string
    categoryId : string,
    toDelete : boolean,
};

interface TaskCreationAttributes
    extends Optional<TaskInterface, 'toDelete'> {}

interface TaskInstance
    extends Model<TaskInterface, TaskCreationAttributes>,
        TaskInterface {
    createdAt?: Date;
    updatedAt?: Date;
}

export default  ( sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<TaskInstance>("tasks" , {
        uid : {
            type : Sequelize.STRING,
            primaryKey : true,
            allowNull : false
        },
        title : {
            type : Sequelize.STRING(256),
            allowNull : false,
        },
        description  :  {
            type : Sequelize.TEXT,
            allowNull : true
        },
        score : {
            type : Sequelize.INTEGER.UNSIGNED,
            allowNull : false
        },
        answer: {
            type : Sequelize.STRING(256),
            allowNull: false
        },
        titleImage: {
            type : Sequelize.STRING(512),
            allowNull : true
        },
        filePath : {
            type : Sequelize.STRING(512),
            allowNull : true,
        },
        toDelete : {
            type : Sequelize.BOOLEAN,
            defaultValue : false,
        },
        categoryId : {
            type  : Sequelize.STRING,
            allowNull : false,
        }

    })
}