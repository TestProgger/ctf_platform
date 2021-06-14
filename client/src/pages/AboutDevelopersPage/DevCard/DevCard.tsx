import React from 'react';

import './DevCard.css';
import vkIcon from '../../../static/images/social/vkontakte_icon.png';
import tgIcon from '../../../static/images/social/telegram_icon.png';
import instaIcon from '../../../static/images/social/instagram_icon.png';


interface InputPropsInterface{
    fullName : string,
    position : string,
    description : string,
    vkLink : string ,
    tgLink : string ,
    instaLink : string

}



function DevCard({ fullName  , position , description , vkLink , tgLink  , instaLink , ...props } : InputPropsInterface ){

    return (

        <div className = "about_devs__card" >
            <div className = "about_devs__card__title" >
                <p className = "h2" >  {fullName} </p>
            </div>

            <div className = "about_devs__card__position underline_dashed" >
                <p className = "h4" >  {position} </p>
            </div>

            <div className = "about_devs__card__description underline_dashed" >
                <p className = "h5 " > {description} </p>
            </div>
                        
            <div className = " row about_devs__card__socials justify-content-center" >
                { vkLink.length ?  
                    <div className = "col-2 card__icon" >  
                        <a href={vkLink} target = "_blank" rel = "noreferrer"> <img src={vkIcon} alt="" /> </a>
                    </div>
                : null }

                { tgLink.length ?  
                    <div className = "col-2 card__icon" >  
                        <a href={tgLink} target = "_blank" rel = "noreferrer"> <img src={tgIcon} alt="" /> </a>
                    </div>
                : null }

                { instaLink.length ?  
                    <div className = "col-2 card__icon" >  
                        <a href={instaLink} target = "_blank" rel = "noreferrer"> <img src={instaIcon} alt="" /> </a>
                    </div>
                : null }
                
            </div>


        </div>


    );

}


export default DevCard;