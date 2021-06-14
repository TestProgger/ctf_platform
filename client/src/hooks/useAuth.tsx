import { useState , useCallback , useEffect} from 'react';

import {useHistory} from 'react-router-dom';

export const apiEndpoint  = "http://127.0.0.1:5000/api/"

export interface LoginDataInterface {
    token : string | null
    uuid : string | null
    gradeBookNumber : string | null
}

export const localStorageName : string = 'authData';

export const useAuth = () => {

    const [ token , setToken ] = useState< string | null>(null);
    const [ uuid , setUUID ] = useState<string | null>(null);
    const [ gradeBookNumber , setGradeBookNumber ] = useState<string | null>(null);

    const history = useHistory();
    const historyLocation : string = history.location.pathname;


    const login =  useCallback( ( responseData : LoginDataInterface ) => {
        setToken( responseData?.token );
        setUUID( responseData?.uuid );
        setGradeBookNumber( responseData?.gradeBookNumber );
        localStorage.setItem( localStorageName , JSON.stringify( responseData) );
        history.push(historyLocation);
     } , []);

     const logout = useCallback(() => {
        setToken( null );
        setUUID( null );
        setGradeBookNumber( null );
        localStorage.removeItem( localStorageName );
     },[]);

     const checkAuthData  = useCallback(() => {
         const authData = localStorage.getItem(localStorageName);
         fetch(apiEndpoint + "/login/checkAuthData" , {
                 method: "POST",
                 headers: {
                     "Content-Type": "application/json"
                 },
                 body : authData
             }
         ).then( data   => data.json() )
             .then( data =>  !(data?.token) ? logout() : login(data)  )
             .catch(_ => logout());
     },[login, logout]);

     useEffect( () => {
        const authData = localStorage.getItem(localStorageName);
        if( authData )
        {
            login(JSON.parse(authData));
            fetch(apiEndpoint + "/login/checkAuthData" , {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body : authData
                }
            ).then( data   => data.json() )
                .then( data =>  !(data?.token) ? logout() : login(data));
                // .catch(_ => logout());
        } else
        {
            logout();
        }

     } , []);
     return { login , logout , checkAuthData , token , uuid , gradeBookNumber };
}