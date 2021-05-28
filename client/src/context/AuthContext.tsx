import {createContext} from 'react'

// tslint:disable-next-line:no-empty
function noop() {}

export interface AuthContextInterface{
    token: string | null,
    uuid: string | null,
    gradeBookNumber : string | null,
    // tslint:disable-next-line:ban-types
    login: Function,
    // tslint:disable-next-line:ban-types
    logout: Function,
    isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextInterface>({
  token: null,
  uuid: null,
  gradeBookNumber : null,
  login: noop,
  logout: noop,
  isAuthenticated: false
})