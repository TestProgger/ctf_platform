import Sequelize  from 'sequelize';
import { Model , Optional } from 'sequelize';
interface TaskCategoryInterface {
    uid: string;
    title: string;
    description : string,
    titleImage : string ,
    shortName : string
}

interface TaskCategoryCreationAttributes
    extends Optional<TaskCategoryInterface, 'uid'> {}

interface TaskCategoryInstance
    extends Model<TaskCategoryInterface, TaskCategoryCreationAttributes>,
        TaskCategoryInterface {
    createdAt?: Date;
    updatedAt?: Date;
}


export default (  sequelize : Sequelize.Sequelize ) => {
    return sequelize.define<TaskCategoryInstance>("task_category" , {
        uid : {
            type : Sequelize.STRING,
            allowNull : false,
            primaryKey : true
        },
        title : {
            type : Sequelize.STRING(64),
            allowNull : false
        },
        description : {
            type : Sequelize.TEXT,
            allowNull : false
        },
        titleImage : {
            type : Sequelize.STRING(512),
            allowNull : true
        },
		shortName : {
			type : Sequelize.STRING(64),
			allowNull : false
		}
    })
}