import React  from "react";
import './TaskModalWindow.css';

interface TaskInterface{
    uid : string
    title : string
    description : string
    score : number
    filePath : string
    titleImage : string
    categoryId : string
    
}

interface IProps{
    showModalWindow : Function
    isShown  : boolean
    data : TaskInterface
}

export const TaskModalWindow = ( { showModalWindow , isShown , data } : IProps ) =>{
    const taskFilesEndpoint = "http://127.0.0.1:5000";
    
    return (
        <div className="modal" style = { isShown ? {display : "flex"} : {display : "none"} }>
            <div className="modal_wrapper">
                <div className="modal_header">
                    <span className="closeBtn" onClick={() => showModalWindow(false)}>&times;</span>
                     { data?.title ? <h3>{data?.title}</h3> : <h3>&nbsp;</h3> } 
                </div>
                <div className="modal_body">
                    <img src={ taskFilesEndpoint +  data?.titleImage } alt="" />

                    <p>{ data?.description }</p>
                </div>
                <div className="modal_footer">
                    <h3>Task File : </h3>
                    <a href={ taskFilesEndpoint +  data?.filePath} download>{ data?.filePath.split("/").pop() }</a>
                </div>
            </div>
        </div>
    );
}

export default TaskModalWindow