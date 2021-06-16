import React, {useState , useContext} from 'react';
import './AuthPage.css';
import {AuthContext} from "../../context/AuthContext";

import { apiEndpoint} from "../../hooks/useAuth";


interface  AuthDataInterface{
    token  : string,
    uuid : string
}

export const AuthPage : React.FC = () => {
    const [login , setLogin] = useState<string>('');
    const [password , setPassword] = useState<string>('');
    const auth = useContext(AuthContext);

    const signInHandler = () => {
        fetch(apiEndpoint + "/" , {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify( { login , password } )
        })
            .then( response => response.json() )
            .then( ( data : AuthDataInterface) =>  auth.login(data) )
            .catch( (error) => console.log(" Ошибка авторизации") );
    }

    return (
            <div className="m-0">
                <div className="auth_page__form row justify-content-center ">
                    <div className="col-3" >
                        <div className="row mb-3 text-center" >
                            <h1 className="h1"> Sign In </h1>
                        </div>
                        <div className="row mb-3 justify-content-center">
                            <input type="text" placeholder="Login"
                                   className  = "form-control"
                                   value={login}
                                   onChange={ (event : React.ChangeEvent<HTMLInputElement>) => setLogin( event.target.value ) }
                            />
                        </div>
                        <div className="row mb-3 justify-content-center">
                            <input type="password" placeholder="Password"
                                   className  = "form-control"
                                   value={password}
                                   onChange={ (event : React.ChangeEvent<HTMLInputElement>) => setPassword( event.target.value ) }

                            />
                        </div>

                        <div className="row  mt-5 mb-3 justify-content-center">
                            <button  className=" btn btn-primary btn-md w-100" onClick={signInHandler} > Sign In</button>
                        </div>


                    </div>
                </div>

            </div>

    );
}