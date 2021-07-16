import React, {useContext, useState} from "react";
import {useHttp} from "../../hooks/useHttp";
import {AuthContext} from "../../context/AuthContext";
import {SaveAlert} from "../../components/SaveAlert";

export const CreateUserPage = () => {

    const [ firstName , setFirstName ] = useState<string>();
    const [ lastName , setLastName ] = useState<string>();
    const [ gradeBookNumber ,  setGradeBookNumber] = useState<string>();
    const [ password , setPassword ] = useState<string>();
    const [successfullySaved , setSuccessfullySaved] = useState<boolean>(false);
    const [saveError , setSaveError] = useState<boolean>(false);

    const { apiEndpoint } = useContext(AuthContext);
    const http = useHttp();

    const generatePassword = (length : number = 10) => {
        const tmpPassword = [];
        for( let i = 0; i < length ; i++)
        {
            tmpPassword.push( String.fromCharCode(  34 + Math.round(  Math.random() * 100 ) %  90 ) );
        }
        setPassword( tmpPassword.join('') );
    }

    const createUser = () => {
        http.post(apiEndpoint + '/createUser' , { firstName,  lastName, gradeBookNumber, password })
            .then( result => {

                if( result?.data.hasOwnProperty('error') )
                {
                    alert(result.data.error);
                    return;
                }

                if( result?.data )
                {
                    setSuccessfullySaved(true)
                    setTimeout(() => setSuccessfullySaved(false), 1500);
                }else
                {
                    setSaveError(true)
                    setTimeout(() => setSaveError(false), 1500);
                }
            } )
    }


    return (
        <div className="container mt-5">
            <div className="row mt-5 mb-5">
                <div className="col-6">
                    <label className="form-label">First name</label>
                    <input type="text" className="form-control"
                           id="category" placeholder="First name"
                           value={firstName}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setFirstName(event.target.value) ; }}
                    />
                </div>

                <div className="col-6">
                    <label className="form-label">Last name</label>
                    <input type="text" className="form-control"
                           id="shortName" placeholder="Last name"
                           value={lastName}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}
                    />
                </div>

            </div>


            <div className="row mt-5 mb-5">
                <div className="col-6">
                    <label className="form-label">Grade Book Number</label>
                    <input type="text" className="form-control"
                           id="category" placeholder="Grade Book Number"
                           value={gradeBookNumber}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setGradeBookNumber(event.target.value) ; }}
                    />
                </div>

                <div className="col-6">
                    <label className="form-label">Password</label>
                    <input type="text" className="form-control"
                           id="shortName" placeholder="Password"
                           value={password}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                           onContextMenu={ (event : React.MouseEvent<HTMLInputElement>) => { event.preventDefault();  generatePassword() }}
                    />
                </div>

            </div>

            <div className="row ">
                <div className="col-12 mt-5 d-flex justify-content-center mt-5">
                    <button className="btn btn-primary btn-lg" onClick={() =>  createUser()}> Create user </button>
                </div>

            </div>


            <SaveAlert success={successfullySaved} unsuccess={saveError}/>


        </div>
    )

}