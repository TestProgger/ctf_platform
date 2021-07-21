import Sequelize, {Model, Optional} from 'sequelize';

interface UserInterface{
    uid : string
    gradeBookNumber : string,
    firstName : string,
    lastName : string,
    password : string,
    uuid : string,
    secretToken : string,
    deleted ?: boolean
};

interface UserCreationAttributes
    extends Optional<UserInterface, 'uuid'> {}

interface UserInstance
    extends Model<UserInterface, UserCreationAttributes>,
        UserInterface {
    createdAt?: Date;
    updatedAt?: Date;
    deleted ?: boolean;
}


export default  (sequelize : Sequelize.Sequelize) => {
    return sequelize.define<UserInstance>('ctf_users' , {
        uid : {
            type : Sequelize.STRING,
            primaryKey : true,
            allowNull : false
        },
        gradeBookNumber : {
            type : Sequelize.STRING(32),
            allowNull : false
        },
        firstName : {
            type :  Sequelize.STRING(32),
            allowNull : false
        },
        lastName : {
            type  : Sequelize.STRING(32),
            allowNull : false
        },
        password : {
            type : Sequelize.STRING(128),
            allowNull : false
        },
        uuid : {
            type : Sequelize.STRING,
        },
        secretToken : {
            type : Sequelize.STRING(128),
            allowNull : false
        },
        deleted : {
            type : Sequelize.BOOLEAN,
            defaultValue : false
        }
    });
}