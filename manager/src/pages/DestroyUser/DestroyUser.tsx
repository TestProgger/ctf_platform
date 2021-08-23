import React, {useContext, useEffect, useState} from "react";
import {useHttp} from "../../hooks/useHttp";

import './DestroyUser.css'
import {AuthContext} from "../../context/AuthContext";

interface IUser{
    uid : string
    firstName : string
    lastName  : string
}

export const DestroyUser = () => {
    const http = useHttp();

    const [ users , setUsers ] = useState<IUser[]>([]);
    const [ deleteList , setDeleteList] = useState<string[]>([]);
    const { apiEndpoint } = useContext(AuthContext);

    useEffect(() => {
        http.get( apiEndpoint + "/getUsers" )
            .then( response => response?.data )
            .then( data => setUsers(data) )
            .catch(console.log);
    } , [])

    const addUserToDeleteList = ( userId : string ) => {
        if( deleteList.includes(userId) )
        {
            setDeleteList(prev => prev.filter( item => item !== userId ));

        }else{
            setDeleteList(prev =>  [...prev ,  userId] );
        }
    }

    const destroyUsers = () => {
        const confirmation  = window.confirm("Are you sure ?");
        if(deleteList.length && confirmation){
            http.post(apiEndpoint + "/destroyUsers" , {uids : deleteList})
                    .then( response => response?.data )
                    .then( data => {
                        if( data?.success )
                        {
                            setUsers( prev => prev.filter( item  => !deleteList.includes(item.uid)) );
                        }
                    } );
        }
    }


    return (
        <div className="destroy_user__container mt-5">

            <div className="row justify-content-end mt-5">
                <div className="col-2">
                    <button className="btn btn-lg btn-danger" onClick={() => destroyUsers()}> Destroy Users </button>
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
                    {users.length ?
                        users.map( (item) => {
                            return (
                                <tr key={item.uid}>
                                    <td align='center' valign='middle'>
                                        <input type="checkbox" className={"form-check-input"} onChange={() => addUserToDeleteList(item.uid)}/>
                                    </td>
                                    <td align='center' valign='middle' >{item.firstName}</td>
                                    <td align='center' valign='middle' >{item.lastName}</td>
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
