import React, {useContext, useEffect, useState} from 'react';
import './HomePage.css';
import {useHttp} from "../../hooks/useHttp";
import {AuthContext} from "../../context/AuthContext";

interface DashboardItemIterface{
    uid : number,
    firstName : string,
    lastName : string,
    scores : number
}


export const Home : React.FC  = () => {

    const date  = new Date();
    const [dashboardItems , setDashboardItems] = useState<DashboardItemIterface[] | any>([]);
    const [ refreshDate  , setRefreshDate ] = useState<string>(date.toLocaleString());

    const http = useHttp();

    const { apiEndpoint } = useContext(AuthContext);

    useEffect(() => {
        const startFetching = async () => {
            const data  = await http.get(apiEndpoint + "/getTopHackers")
            setDashboardItems( data?.data );
        }

        startFetching();


    } , [])

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
                            dashboardItems.map( (item : DashboardItemIterface , index : number) => {
                                return (
                                    <tr key={item.uid}>
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
