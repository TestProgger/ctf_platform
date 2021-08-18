import React   from 'react';
import { Redirect, Route, Switch  } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import AboutDevelopersPage from '../pages/AboutDevelopersPage';
import TaskCategoriesPage from '../pages/TaskCategoriesPage';
import TasksPage from '../pages/TasksPage';
import AuthPage from '../pages/AuthPage';
import ErrorPage from "../pages/ErrorPage";


export const useRoutes  = ( isAuthenticated : boolean ) => {

    if( isAuthenticated )
    {
        return (
            <Switch>
                <Route exact path="/" component={HomePage}  />
                <Route exact path ="/about" component={AboutDevelopersPage}  />
                <Route exact path ="/tasks" component={TaskCategoriesPage}  />
                <Route path ="/tasks/:category" component = {TasksPage} />
                <Route path = "*" component={ErrorPage} />
            </Switch>
        );
    }
    else
    {
        return (
            <Switch>
                <Route exact path = "/auth" component = { AuthPage }/>
                <Redirect exact to="/auth" />
            </Switch>
        );
    }


}
