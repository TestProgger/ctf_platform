import React  ,  {useCallback} from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Home from '../components/Home';
import AboutDevelopers from '../components/AboutDevelopers';
import TaskCategories from '../components/TaskCategories';
import Tasks from '../components/Tasks';
import AuthPage from '../components/AuthPage';
import ErrorPage from "../components/ErrorPage";


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