import axios from 'axios';
import React , {useState , useCallback} from 'react';
import { localStorageName, useAuth } from './useAuth';

export const useHttp = () => {
    // const [headers , setHeaders] = useState<object>();

    const getAuthToken = () => {
        return btoa( localStorage.getItem( localStorageName ) as string );
    }

    const {login} = useAuth();

    const post =  useCallback( async (url : string , body: object | null = null , c_headers : object = {} ) => {
        const headers = {
            "X-Auth-Token" : getAuthToken(),
            ...c_headers
        }

        try{
            const response = await axios.post(url , body , { headers });
            if( (response.data as object).hasOwnProperty('token') ){
                localStorage.removeItem(localStorageName);
            }
            return response;
        }catch( err )
        {
            alert( " Ошибка в запросе " + err)
        }
    }, [getAuthToken]);

    const get = useCallback( async (url : string ,  c_headers : object = {}) => {
        const headers = {
            "X-Auth-Token" : getAuthToken(),
            ...c_headers
        };
        try{
            const response = await axios.get(url , { headers });
            if( (response.data as object).hasOwnProperty('token') ){
                login(response.data);
            }
            return response;
        }catch( err )
        {
            alert( " Ошибка в запросе " + err)
        }
        
    } , [getAuthToken])

    return { get , post };
}