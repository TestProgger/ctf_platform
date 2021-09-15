import React from 'react';
import "./TaskCategoriesPage.css";


import joyIcon from '../../static/images/tasks/joy_icon.png';
import reverseIcon from '../../static/images/tasks/reverse_icon.png';
import steganoIcon from '../../static/images/tasks/stegano_icon.png';
import cryptoIcon from '../../static/images/tasks/crypto_icon.png';
import webIcon from '../../static/images/tasks/web_icon.png';
import linuxIcon from '../../static/images/tasks/linux_icon.png';

import TaskCategoryCard from './TaskCategoryCard';



function TaskCategoriesPage(){

    return (
        <div className="task_categories__app_shadow">
            <div className = "task_categories__container">
                <div className = "row justify-content-center" >
                    <TaskCategoryCard category  = "joy" title = "Joy" icon = {joyIcon}  description = "Simple tasks without straining your brain" />
                    <TaskCategoryCard category  = "reverse" title = "Reverse" icon = {reverseIcon}  description = "Tasks in which you have to figure out executable files" />
                    <TaskCategoryCard category  = "stegano" title = "Stegano" icon = {steganoIcon}  description = "The answers are hidden in a prominent place" />
                </div>
                <div className = "row justify-content-center" >
                    <TaskCategoryCard category  = "crypto" title = "Crypto" icon = {cryptoIcon}  description = "This section will be of interest to those who want to know other people's secrets" />
                    <TaskCategoryCard category  = "web" title = "WEB" icon = {webIcon}  description = "Ever wanted to hack into VK?" />
                    <TaskCategoryCard category  = "linux" title = "Linux" icon = {linuxIcon}  description = "Red-eyes entered the chat" />
                </div>
            </div>
        </div>
    );
}

export default TaskCategoriesPage;
