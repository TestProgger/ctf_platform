import Sequelize, {Model, Optional} from 'sequelize';

interface UserScoresInterface{
    uid : string
    userId : string
    scores : number
};

interface UserScoresAttributes extends Optional<UserScoresInterface , 'scores'>{}

interface CommandInstance
    extends Model<UserScoresInterface, UserScoresAttributes>,
        UserScoresInterface {
    createdAt?: Date;
    updatedAt?: Date;
}

export default  ( sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<CommandInstance>("user_scores" , {
            uid : {
                type : Sequelize.STRING,
                primaryKey : true,
                allowNull : false
            },
            userId : {
                type : Sequelize.STRING,
                unique:  true
            },
            scores : {
                type : Sequelize.INTEGER,
            }
        }
    )
}