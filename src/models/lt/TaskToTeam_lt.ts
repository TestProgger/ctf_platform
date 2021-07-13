import Sequelize, {Model, Optional} from 'sequelize';

interface TaskToTeamLKInterface{
    uid : string
    commandId : string,
    taskId : string,
    toDelete : boolean
};

interface TaskToTeamLKAttributes extends Optional<TaskToTeamLKInterface, 'toDelete'> {}

interface CommandInstance
    extends Model<TaskToTeamLKInterface, TaskToTeamLKAttributes>,
        TaskToTeamLKInterface {
    createdAt?: Date;
    updatedAt?: Date;
}

export default  ( sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<CommandInstance>("task_to_team_lt" , {
            uid : {
                type : Sequelize.STRING,
                primaryKey : true,
                allowNull : false
            },
            commandId : {
                type : Sequelize.STRING(256),
                allowNull : false,
            },
            taskId :{
                type : Sequelize.STRING(256),
                allowNull : false,
            },
            toDelete:{
                type : Sequelize.BOOLEAN,
            }
        }
    )
}