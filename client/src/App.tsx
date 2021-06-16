import React, {useEffect, useState} from 'react';

// Components
import Header  from './components/Header';

// hooks

import { useRoutes } from './hooks/useRoutes';
import {apiEndpoint, LoginDataInterface, useAuth} from './hooks/useAuth';

// Styles
import './App.css';
import './static/css/bootstrap.min.css';

// Context
import  { AuthContext } from './context/AuthContext';
import { ScoreContext } from './context/ScoreContext';
import {useHttp} from "./hooks/useHttp";

function App() {

  const { login , logout , token , uuid  , gradeBookNumber } = useAuth();

  const isAuthenticated : boolean = !!token;

  const routes =  useRoutes(isAuthenticated) ;


  const [ score , setScore]  = useState(0);
  const http = useHttp();
  useEffect( () => {
    http.post( apiEndpoint + '/' )
        .catch( err => logout() );
  } , []);

  return (
    <AuthContext.Provider value = {{ login , logout , token , uuid  , gradeBookNumber, isAuthenticated }} >
        <ScoreContext.Provider value = { { score , setScore} }>
            <div className = "app__shadow" >
              {isAuthenticated ? <Header/> : null}
              { routes }
            </div>
          </ScoreContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
