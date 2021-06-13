import React from 'react';
import { Link } from 'react-router-dom';


import './Header.css';

interface MenuItemInterface{ path : string , title : string };


export const Header : React.FC = (  ) => {


    const menuItems : Array< MenuItemInterface | any> = [
        { path : "/" , title: "Home" },
       
        { path : "/addTask" , title: "Add Task" },
        { path : "/deleteTask" , title : "Delete Task"},
        
        { path : "/addTaskCategory" , title: "Add Task Category" },
        { path : "/deleteTaskCategory" , title: "Delete Task Category"} 
     
        
        
    ]

    return (
        <header className="p-3 bg-dark text-white">
            <div className="container">
                <div className="row justify-content-center">

                    {
                        menuItems.map( item => {
                            return (
                                <div className="col" key={item.title}>
                                    

                                    <Link to={item.path} >  <button className="btn btn-outline-primary text-white btn-sm" >{ item.title }</button>  </Link>
                                </div>
                            );
                        } )
                    }

                </div>
            </div>
        </header>
    );

}