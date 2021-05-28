import React, { Fragment } from 'react';

// Components
import Header  from './components/Header';

// hooks

import { useRoutes } from './hooks/useRoutes';
import { useAuth } from './hooks/useAuth';

// Styles
import './App.css';
import './static/css/bootstrap.min.css';

// Context
import  { AuthContext } from './context/AuthContext';

function App() {

  const { login , logout , token , uuid  , gradeBookNumber } = useAuth();

  const isAuthenticated : boolean = !!token;

  const routes = useRoutes(isAuthenticated);



  return (
    <AuthContext.Provider value = {{ login , logout , token , uuid  , gradeBookNumber, isAuthenticated }} >
          <div className = "app__shadow" >
            {isAuthenticated ? <Header/> : null}
            { routes }
          </div>
    </AuthContext.Provider>
  );
}

export default App;
