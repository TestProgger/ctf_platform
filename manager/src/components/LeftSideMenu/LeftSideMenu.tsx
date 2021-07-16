import React from 'react';
import './LeftSideMenu.css';
import {Link} from "react-router-dom";
interface MenuItemInterface{ path : string , title : string };



export const LeftSideMenu = () => {

    const menuItems : MenuItemInterface[] = [
            { path : "/" , title: "Home" },
            { path : "/createTask" , title: "Add Task" },
            { path : "/createTaskCategory" , title: "Add Task Category" },
            { path : "/getUserStat" , title: "User Stat" },
            { path : "/createUser" , title : "Create User"},
            { path : "/createTeam" , title : "Create Team"}
        ]

    return (

        <div className="left_side__container">
            <ul className="left_side_menu">
                <li>
                    <span >  Statistics </span>
                    <ul className="menu_item" >
                        <li> <Link to='/getUserStat' >  User Stat </Link> </li>
                    </ul>
                </li>

                <li>
                    <span >  Creation </span>
                    <ul className="menu_item" >
                        <li> <Link to='/createUser' >  Create User </Link> </li>
                        <li> <Link to='/createTeam' >  Create Team </Link> </li>
                        <li> <Link to='/createTask' >  Create Task </Link> </li>
                        <li> <Link to='/createTaskCategory' >  Create Task Category </Link> </li>
                    </ul>
                </li>

                <li>
                    <span >  Destroing </span>
                    <ul className="menu_item" >
                        <li></li>
                    </ul>
                </li>
            </ul>



        </div>

    )



}