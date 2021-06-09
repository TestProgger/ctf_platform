import {createContext} from 'react'


function noop(){};

export interface ScoreContextInterface{
    score : number
    setScore : Function
}


export const ScoreContext = createContext<ScoreContextInterface>({
    score : 0,
    setScore: noop
});