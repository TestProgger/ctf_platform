import React, { useState , useContext} from 'react';

import SignIn from './SignIn';
import SignUp from './SignUp';


import './AuthPage.css';


import { AuthContext , AuthContextInterface } from '../../context/AuthContext';
import {useHttp} from "../../hooks/useHttp";
interface RegisterDataInterface{
    firstName : string,
    lastName : string ,
    gradeBookNumber : string ,
    password : string,
    confirmPassword : string
}

function AuthPage(){

    const [ isSignIn , setIsSignIn ] = useState<boolean>(true);

    const { apiEndpoint , ...auth } = useContext<AuthContextInterface>(AuthContext);

    const http = useHttp();

    const singInHandler = ( password : string , gradeBookNumber : string  ) => {
        http.post( `${apiEndpoint}/login` , { password , gradeBookNumber } )
            .then( ( { data } : any ) => {
                if( data?.authorized === false )
                {
                    alert( "Authorization Error: Invalid username or password"  )
                }else
                {
                    auth.login(data);
                }
            } )
            .catch( console.log );
    }


    const signUpHandler = ( registerData : RegisterDataInterface  ) => {
        http.post( `${apiEndpoint}/register` , registerData )
            .then( ( { data } : any ) => {
                if( data?.success ){
                    alert( "You have successfully registered. You can log in" );
                }else{
                    alert( "Error : " + data.errorText );
                }
            } )
            .catch( console.log );
    }



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