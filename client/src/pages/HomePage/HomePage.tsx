import React from 'react';
import './HomePage.css';


import earthMap from '../../static/images/EarthMap.png';
import hackedLogo from '../../static/images/hacked_logo.png';

function HomePage(){

    return(
        <div className="home__app_shadow">
            <div className = "home__container">
                <div className="home__logo" >
                    <img className = "home__earthmap" src={earthMap} alt="" />
                    <img className = "home__title" src={hackedLogo} alt="" />
                </div>
            </div>
        </div>
    );


} 


export default HomePage;