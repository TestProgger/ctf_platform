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
                    <TaskCategoryCard category  = "joy" title = "Joy" icon = {joyIcon}  description = "Различные развлекательные задачи с выбором ответа" />
                    <TaskCategoryCard category  = "reverse" title = "Reverse" icon = {reverseIcon}  description = "Задачи в которых придется разобраться в исполняемых файлах" />
                    <TaskCategoryCard category  = "stegano" title = "Stegano" icon = {steganoIcon}  description = "Ответы спрятаны на видном месте" />
                </div>
                <div className = "row justify-content-center" >
                    <TaskCategoryCard category  = "crypto" title = "Crypto" icon = {cryptoIcon}  description = "Раздел будет интересен тем кто хочет узнать чужие секреты" />
                    <TaskCategoryCard category  = "web" title = "WEB" icon = {webIcon}  description = "Хотели когда нибудь взломать ВК?" />
                    <TaskCategoryCard category  = "linux" title = "Linux" icon = {linuxIcon}  description = "Красноглазики вошли в чат" />
                </div>
            </div>
        </div>
    );
}

export default TaskCategoriesPage;