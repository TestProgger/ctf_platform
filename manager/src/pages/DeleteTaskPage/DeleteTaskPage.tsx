import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { apiEndpoint } from '../../hooks/useAuth';
import { useHttp } from '../../hooks/useHttp';

import './DeleteTaskPage.css';

interface TaskDataInterface{
    title : string , 
    uid : string ,
    taskFile : string ,
    titleImage : string 
}


export const DeleteTaskPage = () => {

    const http = useHttp();

    const [ tasks , setTasks ] = useState<TaskDataInterface | any>([]);

    useEffect( () => {
        http.get( apiEndpoint + "/getTasks" , {})
        .then( ( data:any ) => setTasks(data) )
        .catch( _ => setTasks([]) );
    } , [] );


    return (

        <table className="table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Title</th>
                    <th scope = "col"> Delete </th>
                </tr>
            </thead>
            <tbody>
                {
                    tasks.map(  (  task : TaskDataInterface , index : number ) => {
                        return (
                            <tr>
                                <th scope="row">{ index+1 }</th>
                                <td> {task.title} </td>
                                <td> <button className = "btn btn-danger btn-md" > <span className="glyphicon glyphicon-remove" aria-hidden="true"></span> </button> </td>
                            </tr>
                        )
                    } )
                    
                }
                
            </tbody>
    </table>



    )


}