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

    const raindint = ( min : number , max : number ) : number => {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    const randSeq = ( length :  number = 6 , min : number  , max : number ) : number[] => {
        const seq  = []
        for( let i = 0; i < length ; i++ )
        {
            seq.push(  raindint(min , max) )
        }
        return seq;
    }

    const generatePassword = (length : number = 10) => {

        const alphabet= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$&'

        const tmpPassword = [];
        for( let i = 0; i < length ; i++)
        {
            tmpPassword.push(alphabet[raindint(0 , alphabet.length)] )
        }
        setPassword( tmpPassword.join('') );
    }

    const generateGradeBookNumber = () => {
        setGradeBookNumber( `100502${randSeq(6 , 0 , 9).join("")}`);
    }

    const createUser = () => {
        http.post(apiEndpoint + '/createUser' , { firstName,  lastName, gradeBookNumber, password })
            .then( result => {

                if( result?.data )
                {
                    if( result?.data.hasOwnProperty('error') )
                    {
                        alert(result.data.error);
                        return;
                    }

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
                           onContextMenu={ (event : React.MouseEvent<HTMLInputElement>) => { event.preventDefault();  generateGradeBookNumber() }}
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
                    <button className="btn btn-primary btn-lg w-100" onClick={() =>  createUser()}> Create user </button>
                </div>

            </div>


            <SaveAlert success={successfullySaved} unsuccess={saveError}/>


        </div>
    )

}