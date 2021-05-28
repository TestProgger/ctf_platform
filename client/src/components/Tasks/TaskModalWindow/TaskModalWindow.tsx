import React  from "react";

import './TaskModalWindow.css';

export const TaskModalWindow = (  ) =>{
    return (
        <div id="myModal" className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <span className="close">&times;</span>
                    <h2>Header</h2>
                </div>
                <div className="modal-body">
                    <p>Какой-то текст в теле модального окна</p>
                    <p>Ещё другой текст...</p>
                </div>
                <div className="modal-footer">
                    <h3>Footer</h3>
                </div>
            </div>

        </div>
    );
}

export default TaskModalWindow