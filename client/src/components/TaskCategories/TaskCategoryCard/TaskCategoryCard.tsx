import React from 'react';

import './TaskCategoryCard.css';
import { Link} from 'react-router-dom';

interface InputPropsInterface{
    title : string,
    icon : string,
    description : string,
    category : string
}




function TaskCategoryCard({ title , icon , description , category , ...props } : InputPropsInterface){

    return (
            <div className="col-3">
                <div className = " task_catgory_card" >
                    <Link to={`/tasks/${category}`} >
                        <div  className = " task_category_card_title ">
                            <p  className = "h3"> {title} </p>
                        </div>

                        <div  className = " task_category_card_image ">
                            <img src={icon} alt="" />
                        </div>

                        <div  className = " task_category_card_description ">
                            <p className = "h6">  {description}</p>
                        </div>
                    </Link>

                </div>
            </div>
    );

}

export default TaskCategoryCard;