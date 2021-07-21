import React, {useContext, useEffect, useState} from "react";
import {useHttp} from "../../hooks/useHttp";
import {AuthContext} from "../../context/AuthContext";



interface IUser {
    uid : string,
    firstName ?: string,
    lastName ?: string
}

export const CreateTeamPage = () => {

    const [ teamName , setTeamName ] = useState<string>();
    const [ teamList  , setTeamList ] = useState<string[]>([]);
    const [ userList , setUserList ] = useState<IUser[]>([]);

    const insertNewUser = (userId : string) => {
        if( teamList.indexOf( userId ) === -1 )
        {
            setTeamList(prevState =>  [ ...prevState  , userId ] );
        }else
        {
            setTeamList( prevState => prevState.filter(item => item !== userId));
        }
    }
    const http = useHttp();
    const { apiEndpoint } = useContext(AuthContext);
    useEffect(() => {
        http.get(apiEndpoint + "/getFreeUsers")
            .then( result => {
                if(result?.data?.length){
                    setUserList( result?.data );
                }else {
                    setUserList([]);
                }
            })
    } , []);

    const createTeam = () => {
        http.post(apiEndpoint + "/createTeam" , { teamName , users : teamList })
            .then( result => {
                console.log(result);
            } )
    }

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-6">
                    <label className="form-label"> Team Name </label>
                    <input type="text" className="form-control"
                           id="category" placeholder="Team Name"
                           value={teamName}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setTeamName(event.target.value) ; }}
                    />
                </div>

                <div className="col-6  d-flex justify-content-end">
                    <button onClick={() => createTeam()} className="btn btn-lg btn-primary mt-4"> Create Team </button>
                </div>

            </div>

            <div className="container d-flex justify-content-center mt-5">
                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">First Name </th>
                        <th scope="col">Last Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userList.length ?
                        userList.map( (item  , index : number) => {
                            return (
                                <tr key={item.uid}>
                                    <td align='center' valign='middle'>
                                        <input type="checkbox" onClick={() => insertNewUser(item.uid)} checked={ teamList.indexOf( item.uid )  !== -1}/>
                                    </td>
                                    <td align='center' valign='middle' >{item.firstName}</td>
                                    <td align='center' valign='middle' >{item.lastName}</td>
                                </tr>
                            );
                        } ) : null
                    }
                    </tbody>
                </table>
            </div>




        </div>
    )


}