import React , { useState , useCallback } from 'react';

import {useHistory} from 'react-router-dom';

export interface LoginDataInterface {
    token : string | null
    uuid : string | null
    signUUID : string | null
}

export const localStorageName : string = 'adminAuthData';

export const useAuth = () => {

    const [ token , setToken ] = useState< string | null>(null);
    const [ uuid , setUUID ] = useState<string | null>(null);
    const [signUUID , setSignUUID] = useState<string | null>(null);

    const history = useHistory();
    const historyLocation = history.location.pathname;

    const apiEndpoint = "http://" +  window.location.host.split(":")[0] + ":5000/manager";


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
        localStorage.removeItem( localStorageName );history.go(0);
    },[]);

    return { login , logout , token , uuid , signUUID , apiEndpoint };


}