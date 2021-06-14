import React   from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Home from '../pages/Home';
import AboutDevelopers from '../pages/AboutDevelopers';
import TaskCategories from '../pages/TaskCategories';
import Tasks from '../pages/Tasks';
import AuthPage from '../pages/AuthPage';
import ErrorPage from "../pages/ErrorPage";


export const useRoutes  = ( isAuthenticated : boolean ) => {

    if( isAuthenticated )
    {
        return (
            <Switch>
                <Route exact path="/" component={Home}  />
                <Route exact path ="/about" component={AboutDevelopers}  />
                <Route exact path ="/tasks" component={TaskCategories}  />
                <Route path ="/tasks/:category" component = {Tasks} />
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