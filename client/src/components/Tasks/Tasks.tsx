import React, {useState, useEffect, useContext, Fragment} from 'react';
import { apiEndpoint } from "../../hooks/useAuth";
import {AuthContext, AuthContextInterface} from "../../context/AuthContext";

import {TaskModalWindow} from "./TaskModalWindow";

import './Tasks.css';

interface TaskInterface{
    id : number
    title : string
    description : string
    score : number
    filePath : string
    fileIsImage : boolean
}

function Tasks( { ...props }){
    const authContext   : AuthContextInterface = useContext<AuthContextInterface>(AuthContext);
    const category: string = props.match.params.category;



    useEffect(() => {
        fetch(`/taskCategories/${category}` , {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify( { authData : { token : authContext.token , uuid :  authContext.uuid , gradeBookNumber :  authContext.gradeBookNumber   } , category } )
        })
            .then(response => response.json())
            .then(json => console.log(json));
    });

    return (
        <Fragment>
            <div className="tasks__container">

            </div>
            <TaskModalWindow/>
        </Fragment>
    );


}

export default Tasks;