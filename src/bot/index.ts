import  TelegramBot , {Message , } from "node-telegram-bot-api";
import * as dotenv from 'dotenv'
import { UserDB, UserScoresDB } from "../models";
import  Sequelize  from "sequelize";
dotenv.config();


export const BOT = new TelegramBot(process.env.TG_TOKEN , {polling : true});
export const CHAT_ID = +process.env.CHAT_ID;

const Op = Sequelize.Op;

BOT.onText(/\/getTop (.+)/ , async ( msg : Message  , match: RegExpExecArray) => {
    if( msg.chat.id ===  CHAT_ID ){
        const userScores = await UserScoresDB.findAll({ order : ["scores"] , limit : +match[1] });
        const response = []
        for( let i = 0 ; i <  userScores.length ; i++ )
        {
            const user = await UserDB.findOne( { where : { uid : userScores[i].userId } } );
            response.push( `${i+1}. ${user.firstName} ${user.lastName} ${ userScores[i].scores }` );
        }
        BOT.sendMessage( CHAT_ID, response.join("\n") );
    }
})


