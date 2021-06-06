import React, {useState, useEffect, useContext, Fragment} from 'react';
import { apiEndpoint } from "../../hooks/useAuth";
import {AuthContext, AuthContextInterface} from "../../context/AuthContext";

import {TaskModalWindow} from "./TaskModalWindow";

import './Tasks.css';
import { useHttp } from '../../hooks/useHttp';

interface TaskInterface{
    uid : string
    title : string
    description : string
    score : number
    filePath : string
    titleImage : string
    categoryId : string
    
}

function Tasks( { ...props }){
    const authContext   : AuthContextInterface = useContext<AuthContextInterface>(AuthContext);
    const category: string = props.match.params.category;
    const http = useHttp();

    const [ taskList , setTaskList ] = useState<TaskInterface[]>([]);
    const [ taskData , setTaskData ] = useState<TaskInterface>();
    const [ modalWindowsIsShown , setModalWindowIsShown ] = useState<boolean>(false);


    const openModalWindow = (ind : number  , uid : string ) => {
        setTaskData( taskList[ind] );
        setModalWindowIsShown(true);
    }

    const checkAnswer = (answer : string  , uid : string ) => {

        http.post( apiEndpoint + "/task/checkTaskAnswer" , { answer  , uid } )
        .then( ( response : any)   =>  {

            if( response?.data )
            {
                if( response.data?.success )
                {
                    setTimeout( () => {
                        setModalWindowIsShown(false)
                    } , 1500 )
                    
                }else
                {
                    alert( "Error" )
                }
            }


        })
        .catch( console.log ); 

    }

    useEffect(() => {
        const startFetching = async () => {
            http.post( apiEndpoint + `/taskCategories/${category}` , { category }  , {
                "Content-Type" : "application/json"
            } ).then( ( response : any ) => {
                setTaskList( response?.data?.length ? response.data : [] )    
            } ); 
        }
        startFetching();
        
    }  , []);

    return (
        <Fragment>
            <div className="task__app_shadow">
                <div className="tasks__container">

                    <ol className="list-group list-group-flush task_list mt-5 mb-5">
                        {
                            taskList.map( ( item , ind)  => {
                                return ( <li className="task mb-2" onClick={() => openModalWindow(ind , item.uid)} key = {item.uid}> { item.title } </li> )
                            } )
                        }

                    </ol>
                </div>
            </div>
            <TaskModalWindow checkAnswer = {checkAnswer} data = {taskData as TaskInterface} isShown={modalWindowsIsShown} showModalWindow={setModalWindowIsShown}/>
        </Fragment>
    );


}

export default Tasks;