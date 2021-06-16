import {createContext} from 'react'

function noop() {}

export interface AuthContextInterface{
    token: string | null,
    uuid: string | null,
    login: Function,
    logout: Function,
    isAuthenticated: boolean,
    apiEndpoint : string
}

export const AuthContext = createContext<AuthContextInterface>({
    token: null,
    uuid: null,
    login: noop,
    logout: noop,
    isAuthenticated: false,
    apiEndpoint : ''
})