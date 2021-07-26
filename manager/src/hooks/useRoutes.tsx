import React  from 'react';
import { Route , Switch , Redirect } from 'react-router-dom';

// Components

import Home  from '../pages/HomePage';
import  AddTaskPage  from '../pages/AddTaskPage';
import AddCategoryPage from '../pages/AddCategoryPage';
import AuthPage from '../pages/AuthPage';
import UserStatPage from "../pages/UserStatPage";
import CreateUserPage from '../pages/CreateUserPage';
import CreateTeamPage from '../pages/CreateTeamPage';

// Destroying

import DestroyUser from '../pages/DestroyUser';
import DestroyTeam from '../pages/DestroyTeam';

export const useRoutes  = ( isAuthenticated : boolean ) => {
    if( isAuthenticated )
    {
        return (
            <Switch>
                <Route exact  path="/" component={Home}/>
                <Route path={"/createTask"} component={AddTaskPage}/>
                <Route path={"/createTaskCategory"} component={AddCategoryPage}/>
                <Route path={"/getUserStat" } component = { UserStatPage }/>
                <Route path={"/createUser"} component={CreateUserPage}></Route>
                <Route path={"/createTeam"} component={CreateTeamPage}></Route>
                <Route path={"/destroyUser"} component={DestroyUser}></Route>
                <Route path={"/destroyTeam"} component={DestroyTeam}></Route>
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
