import React, {useContext, useEffect, useRef, useState} from 'react';
import './AddCategoryPage.css';
import {apiEndpoint} from "../../hooks/useAuth";
import {SaveAlert} from "../../components/SaveAlert";
import { useHttp } from '../../hooks/useHttp';
import {AuthContext} from "../../context/AuthContext";



export const AddCategoryPage : React.FC = () => {

    const http = useHttp();

    const [ title , setTitle] = useState<string>('');
    const [ shortName , setShortName ] = useState<string>('');
    const [ description , setDescription ] = useState<string>('');
    const [ titleImage , setTitleImage ] = useState<File>();


    const [successfullySaved , setSuccessfullySaved] = useState<boolean>(false);
    const [saveError , setSaveError] = useState<boolean>(false);


    const _titleImageChangeHandler = ( event : React.ChangeEvent<HTMLInputElement>) => {
        if( event.target.files )
        {
            setTitleImage( event.target.files[0] as File );
        }
    }

    const _addTaskCategoryHandler = (event : React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('titleImage' ,  titleImage as Blob);
        formData.append("title" , title );
        formData.append('description' , description);
        formData.append('shortName' , shortName);

        http.post(apiEndpoint + "/addTaskCategory" , formData)
            .then( response => {
                if(response){
                    if( response.data?.success )
                    {
                        setSuccessfullySaved(true)
                        setTimeout(() => setSuccessfullySaved(false), 1500);
                        setTitle('');
                        setDescription('');
                        setShortName('');
                        // setTitleImage(undefined);
                    }
                    else
                    {
                        setSaveError(true)
                        setTimeout(() => setSaveError(false), 1500);
                    }
                }
                
            } );
    }

    return (
        <div className="container mt-5 ">

            <div className="row">
                <div className="col-6">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-control"
                           id="category" placeholder="Category Title"
                           value={title}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setTitle(event.target.value) ; setShortName(event.target.value.toLowerCase())}}
                    />
                </div>

                <div className="col-6">
                    <label className="form-label">Short Name</label>
                    <input type="text" className="form-control"
                           id="shortName" placeholder="Short Name"
                           value={shortName}
                           onChange={(event: React.ChangeEvent<HTMLInputElement>) => setShortName(event.target.value)}
                    />
                </div>

            </div>

            <div className="row mt-5">
                <div className="form-group">
                    <label className="form-label">Category Description</label>
                    <textarea className="form-control" id="descritption"
                              value={description}
                              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                    ></textarea>
                </div>
            </div>
            <div className="row mt-5">
                <div className="input-group mb-3">
                    <input type="file" className="form-control"
                           id="categoryImage"
                           onChange={_titleImageChangeHandler}
                    />
                    <label className="input-group-text">Title Image</label>
                </div>
            </div>

            <div className="row mt-5">
                <button onClick={_addTaskCategoryHandler} className="btn btn-primary w-100"> Добавить</button>
            </div>
            <SaveAlert success={successfullySaved} unsuccess={saveError}/>
        </div>
    );
}