import React from 'react';

import './AboutDevelopers.css';

// Componets

import DevCard from './DevCard';

function AboutDevelopers(){

    return (
        <div className = "about_devs__container" >
            <div className = "about_devs__title" > 
                <p  className = "h1 title"> About Developers </p>
            </div>

            <div className = " container" >
                <div className = "row justify-content-center" >
                    <DevCard fullName = "Makhmudov Shamil" 
                            position = "Developer"
                            description = "Fun kid and a good developer who else to look for. It has a peculiar approach to business and always brings it to the end."
                            vkLink = "https://vk.com/dubkinec"
                            tgLink = "tggg"
                            instaLink = "instaLink"/>

                    <DevCard fullName = "Aleksandr Kozyr'kov" 
                            position = "Designer"
                            description = "Fun kid and a good designer who else to look for. It has a peculiar approach to business and always brings it to the end."
                            vkLink = "https://vk.com/kozyrkov_alll"
                            tgLink = "tggg"
                            instaLink = "instaLink"/>
                </div>

            </div>
            


        </div>
    );



}


export default AboutDevelopers;