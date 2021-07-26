import React from 'react';


import {useRoutes} from "./hooks/useRoutes";
import { useAuth} from "./hooks/useAuth";
import LeftSideMenu   from './components/LeftSideMenu'
import { AuthContext } from "./context/AuthContext";



import './static/css/bootstrap.min.css';
import './App.css';
function App() {
    const {  apiEndpoint , login , ...auth }  = useAuth();

    const isAuthenticated = !!auth.token;
    const routes = useRoutes(isAuthenticated);




  return (
          <AuthContext.Provider value={{ apiEndpoint, login , ...auth , isAuthenticated}}>
            <div className="App">
                <div className="contaner main">
                    <div className="row">
                        <div className="col-2 lrmp0">
                            { isAuthenticated ?  <LeftSideMenu /> : null}
                        </div>

                        <div className="col-9 lrmp0">

                            <div className="right_side__container">
                                {routes}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
          </AuthContext.Provider>
  );
}

export default App;
