import  TelegramBot , {Message , } from "node-telegram-bot-api";
import * as dotenv from 'dotenv'
import { UserDB, UserScoresDB , TeamDB , TeamScoresDB } from "../models";
import  Sequelize  from "sequelize";
dotenv.config();


export const BOT = new TelegramBot(process.env.TG_TOKEN , {polling : true});
export const CHAT_ID = +process.env.CHAT_ID;

const Op = Sequelize.Op;

// BOT.onText(/\/chat_id (.+)/ , ( msg : Message , match : RegExpExecArray ) => {
//     BOT.sendMessage(msg.chat.id , `${msg.chat.id}`);
// })


BOT.onText(/\/getTop (.+)/ , async ( msg : Message  , match: RegExpExecArray) => {
    if( msg.chat.id ===  CHAT_ID ){
        const userScores = await UserScoresDB.findAll({ order : [["scores" , "DESC"]] , limit : +match[1] });
        const response = []
        for( let i = 0 ; i <  userScores.length ; i++ )
        {
            const user = await UserDB.findOne( { where : { uid : userScores[i].userId } } );
            response.push( `${i+1}. ${user.firstName} ${user.lastName} ${ userScores[i].scores }` );
        }

        BOT.sendMessage( CHAT_ID, response.join("\n") );
    }
})

BOT.onText( /\/teamStat (.+)/ , async ( msg : Message , match : RegExpExecArray ) => {
    if( msg.chat.id === CHAT_ID )
    {
        const teamScores = await TeamScoresDB.findAll({ order : [["scores" , "DESC"]]});
        const response = []

        for( let i = 0; i < teamScores.length ; i++ )
        {
            const team = await TeamDB.findOne( { where : { uid : teamScores[i].teamId } } );
            response.push( `${i+1}. ${ team.title } ${ teamScores[i].scores }` );
        }

        BOT.sendMessage( CHAT_ID, response.join("\n") );
    }
} )
