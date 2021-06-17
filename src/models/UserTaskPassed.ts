import Sequelize, {Model, Optional} from 'sequelize';
interface UserTaskPassedInterface{
    uid : string
    userId : string,
    taskId : string,
    toDelete : boolean,
    score : number
};

interface UserTaskPassedCreationAttributes
    extends Optional<UserTaskPassedInterface, 'toDelete'> {}

interface UserTaskPassedInstance
    extends Model<UserTaskPassedInterface, UserTaskPassedCreationAttributes>,
        UserTaskPassedInterface {
    createdAt?: Date;
    updatedAt?: Date;
}


export default (  sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<UserTaskPassedInstance>("user_task_passed" , {
        uid : {
            type : Sequelize.STRING,
            primaryKey : true,
            allowNull : false
        },
        userId : {
            type : Sequelize.STRING,
            allowNull : false,
        },
        taskId :  {
            type : Sequelize.STRING,
            allowNull : false,
        },
        score: {
            type : Sequelize.INTEGER,
            allowNull :  false
        },
        toDelete : {
            type  : Sequelize.BOOLEAN,
            allowNull : true
        }
    },  {updatedAt : false})
}