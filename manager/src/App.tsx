import React from 'react';


import {useRoutes} from "./hooks/useRoutes";
import {useAuth} from "./hooks/useAuth";
import {Header} from "./components/Header/Header";
import { AuthContext } from "./context/AuthContext";



import './static/css/bootstrap.min.css';
import './App.css';

function App() {
    const auth = useAuth();

    const isAuthenticated = !!auth.token;
    const routes = useRoutes(isAuthenticated);




  return (
          <AuthContext.Provider value={{...auth , isAuthenticated}}>
            <div className="App">
                { isAuthenticated ?  <Header /> : null}
                {routes}
            </div>
          </AuthContext.Provider>
  );
}

export default App;
