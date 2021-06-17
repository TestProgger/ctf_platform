import React, {useContext, useEffect, useState} from 'react';
import './HomePage.css';
import {useHttp} from "../../hooks/useHttp";
import {AuthContext} from "../../context/AuthContext";

interface DashboardItemIterface{
    uid : number,
    firstName : string,
    lastName : string,
    scores : number,
    numWrongAttempts : number,
    numSuccessAttempts : number
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
                            <th scope="col">S/A</th>
                            <th scope="col">U/A</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardItems.length ?
                            dashboardItems.map( (item : DashboardItemIterface , index : number) => {
                                return (
                                    <tr key={item.uid}>
                                        <td align='center' valign='middle'>{index + 1}</td>
                                        <td align='center' valign='middle' >{item.firstName}</td>
                                        <td align='center' valign='middle' >{item.lastName}</td>
                                        <td align='center' valign='middle' >{item.scores}</td>
                                        <td align='center' valign='middle' >{item.numSuccessAttempts}</td>
                                        <td align='center' valign='middle' >{item.numWrongAttempts}</td>
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
