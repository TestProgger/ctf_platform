import React, { Fragment, useContext, useEffect } from 'react';

import { Link} from 'react-router-dom';

import {AuthContext , AuthContextInterface} from '../../context/AuthContext'

import { useHistory } from 'react-router-dom';
import './Header.css';

import logoIcon from '../../static/images/magnifier_logo.png';
import scoreIcon from '../../static/images/cpu_score_icon.png';
import { ScoreContext, ScoreContextInterface } from '../../context/ScoreContext';
import { useHttp } from '../../hooks/useHttp';


export const Header = () => {

    const {apiEndpoint , ...auth} : AuthContextInterface = useContext<AuthContextInterface>( AuthContext );
    const history = useHistory();
    const logoutHandler = (event  : React.MouseEvent<HTMLButtonElement> | null = null) => {
        if( event ){ event.preventDefault() }
        auth.logout();
        history.push("/auth");
    }
    const http = useHttp();
    const { score  , setScore  } : ScoreContextInterface = useContext<ScoreContextInterface>(ScoreContext);

    const checkPassedTasks = async () => {
        try{
            const response = await http.get( apiEndpoint + "/allRequiredTasksPassed" );
            const data = response?.data;

            if( data.allTasksPassed ) {
                logoutHandler();
                alert("All tasks passed");
            }else
            {
                setTimeout( checkPassedTasks , 30000 );
            }
        }catch(ex){
            console.debug(ex);
            setTimeout( checkPassedTasks , 30000 );
        }
    }

    const getScores = async () => {
        try{
            const response = await http.get(apiEndpoint +  "/task/getScoresForCurrentUser");
            const data = response?.data;
            setScore(data?.scores);
            setTimeout( getScores , 20000 );
        }catch(ex){
            console.debug(ex);
            setTimeout( getScores , 20000 );
        }
    }

    


    useEffect( () => {
        setTimeout( () => { getScores();
            checkPassedTasks(); }   , 2000);
        
    } , [] );

    
    return (

        <div className = "header__container" >
            <div className="header__firstBlock" >
                
            </div>

            <div className="header__secondBlock" >
                <div className="row justify-content-center">
                    
                        <div className = "col-2 logo__icon g-0" > 
                            <Link to = "/" >
                                <img src={logoIcon} alt="" width="252" height="152"/> 
                            </Link>
                        </div>
                    <div className = "col-6 g-0">
                        <div> <Link to = "/about" > <p className="h2"> About Developers </p></Link> </div>
                        <div> <Link to = "/tasks" ><p className="h2"> Tasks </p> </Link> </div>
                    </div>

                    <div className = "col-2 g-0 score__board">
                        <div className="row scores justify-content-around"> 
                            <div className = "col"><span className="h4" >{score}</span></div>
                            <div className="col"><img className="score__icon" src={scoreIcon} alt=""/> </div>  
                        </div>
                        <div className="row g-0" > <button className="h5 logout" onClick = { logoutHandler  } > Logout </button> </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
