import React , { useState , useCallback , useEffect} from 'react';

import {useHistory} from 'react-router-dom';
import {useHttp} from "./useHttp";

export interface LoginDataInterface {
    token : string | null
    uuid : string | null
    signUUID : string | null
}

export const localStorageName : string = 'adminAuthData';

export const apiEndpoint  = "http://127.0.0.1:5000/manager/"

export const useAuth = () => {

    const [ token , setToken ] = useState< string | null>(null);
    const [ uuid , setUUID ] = useState<string | null>(null);
    const [signUUID , setSignUUID] = useState<string | null>(null);

    const history = useHistory();
    const historyLocation = history.location.pathname;


    const login =  useCallback( ( responseData : LoginDataInterface ) => {
        setToken( responseData?.token );
        setUUID( responseData?.uuid );
        setSignUUID(responseData?.signUUID);

        localStorage.setItem( localStorageName , JSON.stringify( responseData) );
        history.push(historyLocation);
    } , []);

    const logout = useCallback(() => {
        setToken( null );
        setUUID( null );
        setSignUUID( null );
        localStorage.removeItem( localStorageName );
    },[]);

    return { login , logout , token , uuid , signUUID };


}