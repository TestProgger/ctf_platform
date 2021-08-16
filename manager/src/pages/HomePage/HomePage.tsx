import React, {useContext, useEffect, useState} from 'react';
import './HomePage.css';
import {useHttp} from "../../hooks/useHttp";
import {AuthContext} from "../../context/AuthContext";

import { Doughnut} from "react-chartjs-2/dist";


interface DashboardItemIterface{
    uid : string,
    firstName : string,
    lastName : string,
    scores : number,
    numWrongAttempts : number,
    numSuccessAttempts : number
}

interface DataOnTaskByCategoryInterface{
    categoryName : string
    numOfPassedTasks : number
}

interface DoughnutStateInterface{
    labels : string[],
    datasets: {
        label : string,
        backgroundColor : string[],
        hoverBackgroundColor : string[],
        data : number[]
        hoverOffset: number
    }[]
}

export const Home : React.FC  = () => {

    const [dashboardItems , setDashboardItems] = useState<DashboardItemIterface[] | any>([]);
    const [ dataOnTaskByCategory , setDataOnTaskByCategory ] = useState<DataOnTaskByCategoryInterface[]>([]);
    const [ doughnutState , setDoughnutState ] = useState<DoughnutStateInterface>();

    const http = useHttp();

    const { apiEndpoint } = useContext(AuthContext);

    useEffect(() => {
        const startFetching = async () => {
            const data  = await http.get(apiEndpoint + "/getTopHackers")
            setDashboardItems( data?.data );
        }
        startFetching();
    } , []);

    useEffect(() => {
       const startFetching = async() => {
           const data = await http.get( apiEndpoint + "/getDataPassedTasksByCategory" )
           setDataOnTaskByCategory(data?.data);

           setDoughnutState( {
                labels : data?.data.map( ( item : DataOnTaskByCategoryInterface )  => item.categoryName),
                datasets : [
                    {
                        label : "Passed Tasks Graph",
                        backgroundColor: [
                            '#B21F00',
                            '#C9DE00',
                            '#2FDE00',
                            '#00A6B4',
                            '#6800B4',
                            '#A2FBF0'
                        ],
                        hoverBackgroundColor: [
                            '#501800',
                            '#4B5000',
                            '#175000',
                            '#003350',
                            '#35014F',
                            '#0FFBF0'
                        ],
                        data : data?.data.map(( item : DataOnTaskByCategoryInterface ) => item.numOfPassedTasks),
                        hoverOffset : 4
                    }
                ]
            } );
       }
       startFetching();
    } , []);

    return (
        <div>
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

            <div className="container d-flex mt-5 w-25">
                { doughnutState?.labels.length ?
                    <Doughnut
                        id='32423423'
                        data = {doughnutState}
                        options={{
                            title:{
                                display:true,
                                text:'Diagram of solved tasks',
                                fontSize:20
                            },
                            legend:{
                                display:false,
                                position:'right'
                            }
                        }}
                        type='pie'/> : null }
            </div>


        </div>
    );
}
