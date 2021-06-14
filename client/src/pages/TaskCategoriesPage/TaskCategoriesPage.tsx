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
        <div className = "task_categories__container">
            <div className = "row justify-content-center" >
                <TaskCategoryCard category  = "joy" title = "Joy" icon = {joyIcon}  description = "Различные развлекательные задачи с выбором ответа" />
                <TaskCategoryCard category  = "reverse" title = "Reverse" icon = {reverseIcon}  description = "Различные развлекательные задачи с выбором ответа" />
                <TaskCategoryCard category  = "stegano" title = "Stegano" icon = {steganoIcon}  description = "Различные развлекательные задачи с выбором ответа" />
            </div>
            <div className = "row justify-content-center" >
                <TaskCategoryCard category  = "crypto" title = "Crypto" icon = {cryptoIcon}  description = "Различные развлекательные задачи с выбором ответа" />
                <TaskCategoryCard category  = "web" title = "WEB" icon = {webIcon}  description = "Различные развлекательные задачи с выбором ответа" />
                <TaskCategoryCard category  = "linux" title = "Linux" icon = {linuxIcon}  description = "Различные развлекательные задачи с выбором ответа" />
            </div>
        </div>
    );
}

export default TaskCategoriesPage;