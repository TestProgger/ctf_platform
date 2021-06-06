import React, { useState }  from "react";
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
    checkAnswer : Function
    showModalWindow : Function
    isShown  : boolean
    data : TaskInterface
}

export const TaskModalWindow = ( { checkAnswer, showModalWindow , isShown , data } : IProps ) =>{
    const taskFilesEndpoint = "http://127.0.0.1:5000";
    const [answer , setAnswer] = useState<string>('');
    
    return (
        <div className="modal" style = { isShown ? {display : "flex"} : {display : "none"} }>
            <div className="modal_wrapper">
                <div className="modal_header">
                    <span className="closeBtn" onClick={() => showModalWindow(false)}>&times;</span>
                     { data?.title ? <h3>{data?.title.slice(0 , 20)}</h3> : <h3>&nbsp;</h3> } 
                </div>
                <div className="modal_body">
                    <img src={ taskFilesEndpoint +  data?.titleImage } className="mb-3 mt-3" alt="" />

                    <p className="mr-2 ml-2">{ data?.description }</p>

                    <div className="row mt-4">
                        <div className = "sign_up__form col-9">
                            <input type="text" className="form_input"
                                        placeholder="Answer ...."
                                        value = {answer}
                                        onChange = { (event : React.ChangeEvent<HTMLInputElement>) => setAnswer(event.target.value) }
                                        />

                        </div>
                        <div className="col-3">
                            <button className= "btn btn-outline-success w-100 check_button"
                                onClick = {() => checkAnswer( answer , data.uid ) }
                            >Check</button>
                        </div>
                    </div>

                </div>
                <div className="modal_footer">
                    <div className="row">
                        <div className="col-3">
                            <h3>Task File : </h3>
                        </div>
                        <div className="col-9">
                            <a className="file_anchor" href={ taskFilesEndpoint +  data?.filePath} download>{ data?.filePath.split("/").pop() }</a>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        </div>
    );
}

export default TaskModalWindow