import React, {useState, useEffect, useContext, Fragment, useCallback} from 'react';
import  { Passed , NotPassed}  from './AnswerState/AnswerState';

import {TaskModalWindow} from "./TaskModalWindow";

import './TasksPage.css';
import { useHttp } from '../../hooks/useHttp';
import { ScoreContext, ScoreContextInterface } from '../../context/ScoreContext';

import passedIcon from '../../static/images/ok-icon.png';
import notPassedIcon from '../../static/images/error-icon.png';
import {AuthContext} from "../../context/AuthContext";
import { useHistory } from 'react-router-dom';

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
    const { apiEndpoint  , ...auth} = useContext(AuthContext);

    const history = useHistory();
    const logoutHandler = (event  : React.MouseEvent<HTMLButtonElement> | null = null) => {
        if( event ){ event.preventDefault() }
        auth.logout();
        history.push("/auth");
    }

    const openModalWindow =   (ind : number  , uid : string ) => {
        setTaskData( taskList[ind] );
        setModalWindowIsShown(true);
    }

    const checkAnswer = (answer : string  , taskId : string ) => {

        http.post( apiEndpoint + "/task/checkTaskAnswer" , { answer  , taskId } )
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
                    http.get(apiEndpoint +  "/task/getScoresForCurrentUser")
                    .then( ( response:any ) => response.data )
                    .then( (data) => setScore(data?.scores) )
                    .catch(console.debug);

                    setTaskList( prev => {
                        const ind  = prev.findIndex(item => item.uid === taskId);
                        prev[ind].passed = true;
                        return prev;
                    } )

                }else
                {
                    setCorrectAnswer(false);
                    setWrongAnswer(true);
                    setTimeout( () => setWrongAnswer(false) , 2000 );
                }
            }

            if( response.data?.allTasksPassed ){
                logoutHandler();
                alert("All tasks passed");
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
                setTaskList(  tasks  )  ;
            } );
        }
        startFetching();

    }  , []);


    return (
        <Fragment>
            <div className="task__app_shadow " style={ taskList.length < 10 ? { height : "100vh" } : {height : "100%"} }>
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
            <TaskModalWindow  apiEndpoint={apiEndpoint.replace(/\/api/gmi , '')} checkAnswer = {checkAnswer} data = {taskData as TaskInterface} isShown={modalWindowsIsShown} showModalWindow={setModalWindowIsShown}/>
            { correctAnswer ?  <Passed/> : null}
            { wrongAnswer ?  <NotPassed/> : null}
        </Fragment>
    );


}

export default TasksPage;
