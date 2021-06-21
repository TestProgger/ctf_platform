import React, {useEffect, useState} from 'react';

// Components
import Header  from './components/Header';

// hooks

import { useRoutes } from './hooks/useRoutes';
import { localStorageName, useAuth} from './hooks/useAuth';

// Styles
import './App.css';
import './static/css/bootstrap.min.css';

// Context
import  { AuthContext } from './context/AuthContext';
import { ScoreContext } from './context/ScoreContext';
import {useHttp} from "./hooks/useHttp";
import { useHistory } from 'react-router-dom';
import Footer from './components/Footer';

function App() {

  const { login , logout , token , uuid  , gradeBookNumber , apiEndpoint } = useAuth();

  const isAuthenticated : boolean = !!token;

  const routes =  useRoutes(isAuthenticated) ;


  const [ score , setScore]  = useState(0);
  const http = useHttp();
  const history = useHistory();
  useEffect( () => {
      if( history.location.pathname !==  '/auth'){
          http.post( apiEndpoint + '/' )
              .then( data => login( JSON.parse( localStorage.getItem(localStorageName) as string) ))
              .catch( console.log );
      }
  } , []);

  return (
    <AuthContext.Provider value = {{ login , logout , token , uuid  , gradeBookNumber, isAuthenticated , apiEndpoint }} >
        <ScoreContext.Provider value = { { score , setScore} }>
            <div className = "app__shadow" >
              {isAuthenticated ? <Header/> : null}
              { routes }
              {isAuthenticated ? <Footer/> : null}
            </div>
          </ScoreContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
