import React from 'react';
import './LeftSideMenu.css';
import {Link} from "react-router-dom";



export const LeftSideMenu = () => {
    return (

        <div className="left_side__container">


            <div className="row left_side_title justify-content-center">
                <Link to = "/" className={'nav-link'}> <h1 > HOME </h1> </Link>
            </div>


            <div className="row left_side_title">
                <h4> Creation </h4>
            </div>

            <nav className="nav flex-column justify-content-center mb-3">
                <Link to = "/createUser" className={'nav-link'}> Create User </Link>
                <Link to = "/createTeam" className={'nav-link'}> Create Team </Link>
                <Link to = "/createTask" className={'nav-link'}> Create Task </Link>
                <Link to = "/createTaskCategory" className={'nav-link'}> Create Task Category </Link>
            </nav>

            <div className="row left_side_title">
                <h4> Statistics </h4>
            </div>

            <nav className="nav flex-column mb-3">
                <Link to = "/getUserStat" className={'nav-link'}> Get UserStat </Link>
            </nav>

            <div className="row left_side_title">
                <h4> Destroing </h4>
            </div>

            <nav className="nav flex-column">
                <a className="nav-link" href="#">Active</a>
                <a className="nav-link" href="#">Link</a>
                <a className="nav-link" href="#">Link</a>
                <a className="nav-link" href="#">Disabled</a>
            </nav>
        </div>

    )



}