import Sequelize, {Model, Optional} from 'sequelize';

interface TeamInterface{
    uid : string
    title : string
};

interface TeamCreationAttributes
    extends Optional<TeamInterface, 'title'> {}

interface CommandInstance
    extends Model<TeamInterface, TeamCreationAttributes>,
        TeamInterface {
    createdAt?: Date;
    updatedAt?: Date;
}

export default  ( sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<CommandInstance>("teams" , {
            uid : {
                type : Sequelize.STRING,
                primaryKey : true,
                allowNull : false
            },
            title : {
                type : Sequelize.STRING(256),
                allowNull : false,
                unique : true
            },
        }
    )
}