import React, {useContext, useEffect, useState} from 'react';
import './HomePage.css';
import {useHttp} from "../../hooks/useHttp";
import {apiEndpoint} from "../../hooks/useAuth";
import {AuthContext} from "../../context/AuthContext";

interface DashboardItemIterface{
    id : number,
    firstName : string,
    lastName : string,
    scores : number
}


export const Home : React.FC  = () => {

    const date  = new Date();
    const [dashboardItems , setDashboardItems] = useState<DashboardItemIterface[]>([]);
    const [ refreshDate  , setRefreshDate ] = useState<string>(date.toLocaleString());

    const http = useHttp();


    // useEffect(() => {
    //     const startFetching = async() => {
    //         const data  = await http.get(apiEndpoint + "/getTopHackers");
    //         console.log(data);
    //     }
    //     startFetching();
    // } , []);

    return (
        <div>Home Page {refreshDate}
            <div className="container d-flex justify-content-center mt-5">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">First Name </th>
                            <th scope="col">Last Name</th>
                            <th scope="col">Scores</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardItems.length ?
                            dashboardItems.map( (item , index) => {
                                return (
                                    <tr key={item.id}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{item.firstName}</td>
                                        <td>{item.lastName}</td>
                                        <td>{item.scores}</td>
                                    </tr>
                                );
                            } ) : null
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
