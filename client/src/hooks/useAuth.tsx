import { useState , useCallback , useEffect} from 'react';

import {useHistory} from 'react-router-dom';
import { useHttp } from './useHttp';

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

    const http = useHttp();


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

     useEffect( () => {
        http.post( apiEndpoint + '/' )
        .then( ( data: any)   => !(data?.token) ? logout() : login(data) )
        .catch( err => logout() );
     } , []);
     return { login , logout , token , uuid , gradeBookNumber };
}