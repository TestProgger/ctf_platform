import axios from 'axios';
import React , { useCallback} from 'react';
import { localStorageName} from './useAuth';

import {useHistory} from 'react-router-dom';

export const useHttp = () => {

    const getAuthToken = () => {
        return btoa( localStorage.getItem( localStorageName ) as string );
    }

    const getFingerprint = () => {
        const timezone = new Date().getTimezoneOffset();
        const { width , height  , colorDepth , pixelDepth} = window.screen;
        const {languages , appCodeName} = window.navigator;

        return btoa( JSON.stringify(
            {
                timezone ,
                screenConf : {
                    width ,
                    height ,
                    colorDepth ,
                    pixelDepth
                },
                languages,
                appCodeName
            }
            ) )

    }

    const history = useHistory();

    const post =  useCallback( async (url : string , body: object | null = null , customHeaders : object = {} ) => {
        const headers = {
            "X-Auth-Token" : getAuthToken(),
            "X-Finger-Data" : getFingerprint(),
            ...customHeaders
        }
        try{
            const response = await axios.post(url , body , { headers });
            return response;
        }catch( err )
        {
            localStorage.removeItem(localStorageName);
            history.go(0);
        }
    }, []);

    const get = useCallback( async (url : string ,  customHeaders : object = {}) => {
        const headers = {
            "X-Auth-Token" : getAuthToken(),
            "X-Finger-Data" : getFingerprint(),
            ...customHeaders
        };
        try{
            const response = await axios.get(url , { headers });
            return response;
        }catch( err )
        {
            localStorage.removeItem(localStorageName);
            history.go(0);
        }
    } , [])

    return { get , post };
}