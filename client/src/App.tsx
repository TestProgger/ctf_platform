import React, {  useState } from 'react';

// Components
import Header  from './components/Header';

// hooks

import { useRoutes } from './hooks/useRoutes';
import { LoginDataInterface, useAuth } from './hooks/useAuth';

// Styles
import './App.css';
import './static/css/bootstrap.min.css';

// Context
import  { AuthContext } from './context/AuthContext';
import { ScoreContext } from './context/ScoreContext';

function App() {

  const { login , logout , token , uuid  , gradeBookNumber } = useAuth();

  const isAuthenticated : boolean = !!token;

  const routes =  useRoutes(isAuthenticated) ;


  const [ score , setScore]  = useState(0);

  window.onstorage = ( { key , newValue } : StorageEvent ) => {

    if( key === 'authData' )
    {
      try{
        const authData : LoginDataInterface = JSON.parse( newValue as string);
        if( !( authData.token && authData.gradeBookNumber && authData.uuid) )
        {
          logout();
        }
      
      }
      catch( ex )
      {
        logout();
      }
      

    }

    
  }

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
