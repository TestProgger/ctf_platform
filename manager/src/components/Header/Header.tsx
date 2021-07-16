import React from 'react';
import { Link } from 'react-router-dom';


import './Header.css';

interface MenuItemInterface{ path : string , title : string };
export const Header : React.FC = (  ) => {




    const menuItems : MenuItemInterface[] = [
        { path : "/" , title: "Home" },
        { path : "/createTask" , title: "Add Task" },
        { path : "/createTaskCategory" , title: "Add Task Category" },
        { path : "/getUserStat" , title: "User Stat" },
        { path : "/createUser" , title : "Create User"},
        { path : "/createTeam" , title : "Create Team"}
    ]

    return (
        <header className="p-3 bg-dark text-white">
            <div className="container">
                <div className="row justify-content-center">

                    {
                        menuItems.map( item => {
                            return (
                                <div className="col d-flex justify-content-center" key={item.title}>
                                    <Link to={item.path} >  <button className="btn btn-outline-primary text-white btn-md" >{ item.title }</button>  </Link>
                                </div>
                            );
                        } )
                    }

                </div>
            </div>
        </header>
    );

}