import  TelegramBot , {Message , } from "node-telegram-bot-api";
import * as dotenv from 'dotenv'
import { UserDB, UserScoresDB , TeamDB , TeamScoresDB } from "../models";
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

BOT.onText( /\/teamStat/ , async ( msg : Message , match : RegExpExecArray ) => {
    if( msg.chat.id === CHAT_ID )
    {
        const teams = await TeamDB.findAll();
        const response = []

        for( let i = 0; i < teams.length ; i++ )
        {
            const teamScore = await TeamScoresDB.findOne( { where : { teamId : teams[i].uid } } );
            response.push( `${i+1}. ${ teams[i].title } ${ teamScore.scores }` );
        }

        response.sort( ( a , b ) => +b.split(" ")[2] - +a.split(" ")[2] );

        BOT.sendMessage( CHAT_ID, response.join("\n") );
    }
} )
