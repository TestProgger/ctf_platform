import React, {useContext, useState} from "react";
import {useHttp} from "../../hooks/useHttp";
import {AuthContext} from "../../context/AuthContext";

import {Doughnut} from "react-chartjs-2/dist";

interface UserDataInterface {
    firstName ?: string | null,
    lastName ?:string,
    gradeBookNumber ?: string
}

export const UserStatPage = () => {

    const [ gradeBookNumber , setGradeBookNumber ] = useState<string>('');
    const [ doughnutState , setDoughnutState ] = useState<any>();
    const [ userNotFound , setUserNotFound ] = useState<boolean>(false);

    const [userData , setUserData] = useState<UserDataInterface>({firstName : null});

    const http = useHttp(false);
    const {apiEndpoint}  = useContext(AuthContext);

    const getUserStat = async () => {
        const data = await http.get(apiEndpoint + `/getUserStat/?gbn=${gradeBookNumber}`);
        if (data?.data) {
            const {passedTasksStat, ...userD} = data?.data;

            setUserData(userD);

            let tmpSum: number = 0;

            for (const stat of passedTasksStat) {
                tmpSum += stat.numOfPassedTasks;
            }

            if (tmpSum) {
                setDoughnutState({
                    labels: passedTasksStat.map((item: any) => item.categoryName),
                    datasets: [
                        {
                            label: "Passed Tasks Graph",
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
                            data: passedTasksStat.map((item: any) => item.numOfPassedTasks),
                            hoverOffset: 4
                        }
                    ]
                });
            } else {
                setDoughnutState({
                    labels: ['Nothing'],
                    datasets: [
                        {
                            label: "Passed Tasks Graph",
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
                            data: [1],
                            hoverOffset: 4
                        }
                    ]
                });
            }
            setUserNotFound(false);


        } else
        {
            setUserNotFound(true);
        }

    }

    return (
        <div className="container">
            <div className="row">
                <div className="row mb-3 mt-5">
                    <div className="col-3 mt-2">
                        <label htmlFor="exampleFormControlInput1" className="form-label">Grade Book Number : </label>
                    </div>
                    <div className="col-6">
                        <input type="text" className="form-control"
                               value={gradeBookNumber}
                               onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGradeBookNumber(event.target.value)}/>
                    </div>
                    <div className="col-3">
                        <button className="btn btn-primary btn-md" onClick={() => getUserStat()}> Get User Stat</button>
                    </div>
                </div>
            </div>
            { !userNotFound && userData?.firstName !== null ?
                <div className="container mt-5">
                    <div className="row mt-5">
                        <div className="col-6">
                            <div className="row justify-content-center">
                                <label htmlFor="inputPassword" className="col-sm-3 col-form-label">First Name</label>
                                <div className="col-sm-7">
                                    <input type="text" className="form-control" value={userData?.firstName ? userData?.firstName : '' } disabled/>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="row justify-content-center">
                                <label htmlFor="inputPassword" className="col-sm-3 col-form-label">Last Name</label>
                                <div className="col-sm-7">
                                    <input type="text" className="form-control" value={userData?.lastName} disabled/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>  : null}
            { userNotFound  ? <h1 className="h1" > User with this Grade Book Number was not found </h1> : null }
                <div className="container w-50 mt-5  mb-5 justify-content-center d-flex">
                    { !userNotFound && userData?.firstName !== null
                        ?
                        <Doughnut
                            data={doughnutState}
                            options={{
                                title: {
                                    display: true,
                                    text: 'Diagram of solved tasks',
                                    fontSize: 20
                                },
                                legend: {
                                    display: false,
                                    position: 'right'
                                }
                            }}
                            type='pie'
                        />
                        :
                        null
                    }
                </div>

        </div>

    );
}