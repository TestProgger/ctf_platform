import React, {useState, useEffect, useContext, Fragment} from 'react';
import { apiEndpoint } from "../../hooks/useAuth";
import  { Passed , NotPassed}  from './AnswerState/AnswerState';

import {TaskModalWindow} from "./TaskModalWindow";

import './TasksPage.css';
import { useHttp } from '../../hooks/useHttp';
import { ScoreContext, ScoreContextInterface } from '../../context/ScoreContext';

import passedIcon from '../../static/images/green-ok-icon.png';
import notPassedIcon from '../../static/images/error-icon.png';

interface TaskInterface{
    uid : string
    title : string
    description : string
    score : number
    filePath : string
    titleImage : string
    categoryId : string
    passed : boolean
    
}




function TasksPage( { ...props }){
    const category: string = props.match.params.category;
    const http = useHttp();

    const [ taskList , setTaskList ] = useState<TaskInterface[]>([]);
    const [ taskData , setTaskData ] = useState<TaskInterface>();
    const [ modalWindowsIsShown , setModalWindowIsShown ] = useState<boolean>(false);

    const [ wrongAnswer , setWrongAnswer ] = useState<boolean>(false);
    const [ correctAnswer , setCorrectAnswer ] = useState<boolean>(false);


    const {setScore} :  ScoreContextInterface = useContext(ScoreContext);


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

                    setCorrectAnswer(true);
                    setWrongAnswer(false);

                    setTimeout( () => setCorrectAnswer(false) , 2000 );

                    // sc.setScore( (prevScore : number) => prevScore + response.data?.score );
                    http.post(apiEndpoint +  "/task/getScoresForCurrentUser")
                    .then( ( response:any ) => response.data )
                    .then( (data) => setScore(data?.scores) )
                    .catch(console.debug);
                    
                }else
                {
                    setCorrectAnswer(false);
                    setWrongAnswer(true);

                    setTimeout( () => setWrongAnswer(false) , 2000 );
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
                let tasks = [];
                if( response?.data?.length ){
                    tasks = response?.data.map( ( item : { dataValues : object , passed : boolean }) => {
                        return { ...item.dataValues ,  passed : item.passed }
                    } );
                }
                setTaskList(  tasks  )   ; 
            } ); 
        }
        startFetching();
        
    }  , []);


    return (
        <Fragment>
            <div className="task__app_shadow ">
                <div className="row justify-content-center">
                    <table className="table w-75 mt-4">
                        <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Title</th>
                            <th scope="col">Score</th>
                            <th scope="col">Passed</th>
                        </tr>
                        </thead>
                        <tbody>
                            
                            {
                                    taskList.map( ( item , ind)  => {
                                        return (                                             
                                            <tr key = {item.uid} onClick={() => openModalWindow(ind , item.uid)} >
                                                <td  valign="middle" align="center" className="index">{ ind +1 }</td>
                                                <td valign="middle" align="center"> { item.title } </td>
                                                <td valign="middle" align="center"> { item.score } </td>
                                                <td valign="middle" align="center"> <img src={ item.passed ? passedIcon : notPassedIcon } alt="" width="48px" /> </td>
                                            </tr>

                                        )
                                    } )
                                
                            }

                        </tbody>
                    </table>
                </div>
            </div>
            <TaskModalWindow checkAnswer = {checkAnswer} data = {taskData as TaskInterface} isShown={modalWindowsIsShown} showModalWindow={setModalWindowIsShown}/>
            { correctAnswer ?  <Passed/> : null}
            { wrongAnswer ?  <NotPassed/> : null}
        </Fragment>
    );


}

export default TasksPage;