import React from "react";

import './AnswerState.css'

import okIcon  from  "../../../static/images/green-ok-icon.png";
import errIcon  from  "../../../static/images/error-icon.png";

export const Passed = () => {
    return(
        <div className="answer_state__container" >
            <div className="row justify-content-center">
                <div className="col-2">
                    <img src={okIcon} alt="" />

                </div>
                <div className="col-8 mt-2">
                    Correct Answer
                </div>
            </div>
        </div>
    )
}
export const NotPassed = () => {
    return(
        <div className="answer_state__container" >
            <div className="row justify-content-center">
                <div className="col-2">
                    <img src={errIcon} alt="" />

                </div>
                <div className="col-8 mt-2">
                    Wrong Answer
                </div>
            </div>
        </div>
    )
}