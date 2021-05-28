import React, { useState , useContext} from 'react';

import SignIn from './SignIn';
import SignUp from './SignUp';

import './AuthPage.css';


import { apiEndpoint, useAuth } from '../../hooks/useAuth';
import { useHistory } from 'react-router-dom';

import { AuthContext , AuthContextInterface } from '../../context/AuthContext';


function AuthPage(){

    const [ isSignIn , setIsSignIn ] = useState<boolean>(true);

    const auth :  AuthContextInterface = useContext<AuthContextInterface>(AuthContext);


    const singInHandler = ( password : string , gradeBookNumber : string  ) => {
        fetch( `${apiEndpoint}/login` ,  {
            method : 'POST',
            body : JSON.stringify( { password , gradeBookNumber } ),
            headers: {
                'Content-Type': 'application/json'
              }
        }).then( response => response.json() )
        .then( responseData => auth.login(responseData)  )
        .catch( error => auth.logout() );
    }


    const signUpHandler = (  ) => {  return 0;}



    const styles = {
        active : {
                background: "#1BBF00",
                borderRadius: "57px",
                borderStyle: "none",
                color: "#000000",
                fontSize: "130%",
                width: "150px",
                height: "40px",
                marginLeft: "5%"
        },
        inactive : {
            background: "rgba(0,0,0,1)",
            borderRadius: "57px",
            border: "1px solid #1BBF00",
            color: "#1BBF00",
            fontSize: "130%",
            width: "150px",
            height: "40px",
            marginLeft: "5%"
        }
    }
    return (
        <div className="auth_page__app_shadow">
            <div className = "auth_page__container"> 

                { isSignIn ?  <SignIn signInHandler = {singInHandler}/> : <SignUp signUpHandler = {signUpHandler}/> }
                
                <div className  = "auth_page__buttons">
                    <button style = {isSignIn ? styles.active : styles.inactive} onClick={ () =>  setIsSignIn(true) }> Sign In </button>
                    <button style = {isSignIn ? styles.inactive : styles.active} onClick = { () => setIsSignIn(false) } > Sign Up </button>
                </div>
                
                
            </div>
        </div>
    );
}

export default AuthPage;