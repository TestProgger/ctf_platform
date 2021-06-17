import Sequelize, {Model, Optional} from 'sequelize';

interface WrongAnswerInterface{
    uid : string ,
    userId : string,
    taskId : string,
    answer : string,
    toDelete : boolean
};

interface WrongAnswersCreationAttributes
    extends Optional<WrongAnswerInterface, 'toDelete'> {}

interface TaskInstance
    extends Model<WrongAnswerInterface, WrongAnswersCreationAttributes>,
        WrongAnswerInterface {
    createdAt?: Date;
    updatedAt?: Date;
}

export default  ( sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<TaskInstance>("wrong_answers" , {
        uid : {
            type : Sequelize.STRING,
            primaryKey : true,
            allowNull : false
        },
        userId : {
            type  : Sequelize.STRING,
            allowNull : false,
        },
        taskId : {
            type: Sequelize.STRING,
            allowNull: false,
        },
        toDelete : {
            type : Sequelize.BOOLEAN,
            defaultValue : false,
        },
        answer : {
            type  : Sequelize.STRING,
            allowNull : false,
        }

    } , { updatedAt : false});
}