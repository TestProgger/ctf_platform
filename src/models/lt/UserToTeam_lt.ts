import Sequelize, {Model, Optional} from 'sequelize';

interface UserToTeamLKInterface{
    uid : string
    teamId : string,
    userId : string,
    toDelete : boolean
};

interface UserToTeamLKAttributes extends Optional<UserToTeamLKInterface, 'toDelete'> {}

interface CommandInstance
    extends Model<UserToTeamLKInterface, UserToTeamLKAttributes>,
        UserToTeamLKInterface {
    createdAt?: Date;
    updatedAt?: Date;
}

export default  ( sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<CommandInstance>("user_to_team_lt" , {
            uid : {
                type : Sequelize.STRING,
                primaryKey : true,
                allowNull : false
            },
            teamId : {
                type : Sequelize.STRING(256),
                allowNull : false,
            },
            userId :{
                type : Sequelize.STRING(256),
                allowNull : false,
            },
            toDelete:{
                type : Sequelize.BOOLEAN,
            }
        }
    )
}