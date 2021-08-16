import React, {useContext, useEffect, useState} from "react";
import {useHttp} from "../../hooks/useHttp";

import './DestroyTeam.css'
import {AuthContext} from "../../context/AuthContext";

interface ITeam{
    uid : string
    title : string
}

export const DestroyTeam = () => {
    const http = useHttp();

    const [ teams , setTeams ] = useState<ITeam[]>([]);
    const [fullDestroy , setFullDestroy] = useState<boolean>(false);
    const [ deleteList , setDeleteList] = useState<string[]>([]);
    const { apiEndpoint } = useContext(AuthContext);

    useEffect(() => {
        http.get( apiEndpoint + "/getTeams" )
            .then( response => response?.data )
            .then( data => setTeams(data) )
            .catch(console.log);
    } , [])

    const addTeamToDeleteList = ( userId : string ) => {
        if( deleteList.includes(userId) )
        {
            setDeleteList(prev => prev.filter( item => item !== userId ));
        }else{
            
            setDeleteList( prev => [ ...prev , userId ] );
        }
    }

    const destroyTeams = () => {
        const confirmation  = window.confirm("Are you sure ?");
        if(deleteList.length && confirmation){
            http.post(apiEndpoint + "/destroyTeams" , {uids : deleteList , fullDestroy})
                    .then( response => response?.data )
                    .then( data => {
                        if( data?.success )
                        {
                            setTeams( prev => prev.filter( item  => deleteList.includes(item.uid)) );
                        }
                    } );
        }
    }


    return (
        <div className="destroy_user__container mt-5">
            <div className="container">
                <div className="row justify-content-between mt-5">
                    <div className="col-4">
                        <div className="input-group">
                            <div className="input-group-text btn-danger">
                                <input className="form-check-input mt-0" type="checkbox" onChange={ () => setFullDestroy(!fullDestroy) }/>
                            </div>
                            <input type="text" className="form-control btn-danger" value={"Full Destroy (Dangerous)"} disabled onChange={ () => setFullDestroy(!fullDestroy) }/>
                        </div>
                    </div>
                    <div className="col-3 d-flex justify-content-end">
                        <button className="btn btn-lg btn-danger" onClick={() => destroyTeams()}> Destroy Teams </button>
                    </div>

                </div>
            </div>

            <div className="container d-flex justify-content-center mt-5">
                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">First Name </th>
                        <th scope="col">Last Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {teams.length ?
                        teams.map( (item) => {
                            return (
                                <tr key={item.uid}>
                                    <td align='center' valign='middle'>
                                        <input type="checkbox" className={"form-check-input"} onChange={() => addTeamToDeleteList(item.uid)}/>
                                    </td>
                                    <td align='center' valign='middle' >{item.title}</td>
                                </tr>
                            );
                        } ) : null
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}
