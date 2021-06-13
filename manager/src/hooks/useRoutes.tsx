import React  from 'react';
import { Route , Switch , Redirect } from 'react-router-dom';

// Components

import Home  from '../pages/HomePage';
import  AddTaskPage  from '../pages/AddTaskPage';
import AddCategoryPage from '../pages/AddCategoryPage';
import AuthPage from '../pages/AuthPage';
import DeleteTaskPage from '../pages/DeleteTaskPage';



export const useRoutes  = ( isAuthenticated : boolean ) => {
    if( isAuthenticated )
    {
        return (
            <Switch>
                <Route exact  path="/" component={Home}/>
                <Route path="/addTask" component={AddTaskPage}/>
                <Route path="/deleteTask" component={ DeleteTaskPage }/>
                <Route path="/addTaskCategory" component={AddCategoryPage}/>
            </Switch>
        )
    }
    else
    {
        return (
            <Switch>
                <Route exact path="/auth" component={AuthPage} />
                <Redirect to="/auth" />
            </Switch>
        )
    }
}