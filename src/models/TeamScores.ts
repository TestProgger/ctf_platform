import Sequelize, {Model, Optional} from 'sequelize';

interface TeamScoresInterface{
    uid : string
    teamId : string
    scores : number
};

interface TeamScoresAttributes extends Optional<TeamScoresInterface , 'scores'>{}

interface CommandInstance
    extends Model<TeamScoresInterface, TeamScoresAttributes>,
        TeamScoresInterface {
    createdAt?: Date;
    updatedAt?: Date;
}

export default  ( sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<CommandInstance>("team_scores" , {
            uid : {
                type : Sequelize.STRING,
                primaryKey : true,
                allowNull : false
            },
            teamId : {
                type : Sequelize.STRING,
                unique:  true
            },
            scores : {
                type : Sequelize.INTEGER,
            }
        }
    )
}