import React, {useEffect, useRef, useState} from 'react';
import './AddTaskPage.css';
import {apiEndpoint} from "../../hooks/useAuth";
import {SaveAlert} from '../../components/SaveAlert';
import { useHttp } from '../../hooks/useHttp';


export const AddTaskPage : React.FC = () => {

    const [title , setTitle] = useState<string>('');
    const [score , setScore] = useState<number>(0);
    const [answer,  setAnswer] = useState<string>('');
    const [description ,setDescription] = useState<string>('');
    const [categoryId , setCategoryId] = useState<string>('');
    const [categoryList , setCategoryList] = useState<{uid : string , title : string}[]>([]);

    const [titleImage , setTitleImage] = useState<File>();
    const [taskFile , setTaskFile] = useState<File>();

    const http = useHttp();

    const [successfullySaved , setSuccessfullySaved] = useState<boolean>(false);
    const [saveError , setSaveError] = useState<boolean>(false);

    const _titleImageChangeHandler = ( event : React.ChangeEvent<HTMLInputElement>) => {
        if( event.target.files )
        {
            setTitleImage( event.target.files[0] as File );
        }
    }
    const _taskFileChangeHandler = ( event : React.ChangeEvent<HTMLInputElement>) => {
        if( event.target.files )
        {
            setTaskFile( event.target.files[0] as File );
        }
    }

    const _addTaksHandler = (event  : React.MouseEvent<HTMLButtonElement>) => {
        const formData = new FormData();

        formData.append("title" , title);
        formData.append("score" , score.toString());
        formData.append("answer" , answer);
        formData.append("description" , description);
        formData.append("categoryId" , categoryId);
        formData.append("titleImage" , titleImage as Blob);
        formData.append("taskFile" , taskFile as Blob);

        http.post(apiEndpoint + "/addTask" , formData)
            .then(result => {
                if( result){
                    // console.log(result);
                    if( result.data?.success )
                    {
                        setSuccessfullySaved(true)
                        setTimeout(() => setSuccessfullySaved(false), 1500);
                        setDescription('');
                        setTitle('');
                        setAnswer('');
                        setScore(0);
                        // setCategoryId('');
                        // setCategoryList([]);
                        // setTitleImage(undefined);
                        // setTaskFile(undefined);
                    }else
                    {
                        setSaveError(true)
                        setTimeout(() => setSaveError(false), 1500);
                    }
                }
                
            });


    }


    useEffect(() => {
        const startFetching = async () => {
            const response = await http.get(apiEndpoint + '/getTaskCategories')
            if( response ){
                setCategoryList(response.data)     // Правильно!
            }
            
        }
        startFetching()
    }, []);

    return (
        <div className="container">

            <div className="row justify-content-around mt-5">
                <div className="col-6">
                    <label htmlFor="exampleFormControlInput1" className="form-label">Title</label>
                    <input type="text" className="form-control" name="title" placeholder="Title ... "
                            value = {title}
                           onChange={ (event: React.ChangeEvent<HTMLInputElement>) => setTitle(event.target.value) }
                    />
                </div>
                <div className="col-6">
                    <label htmlFor="exampleFormControlInput1" className="form-label">Score</label>
                    <input type="text" className="form-control" name="score" placeholder="Score .... "
                           value = {score}
                           onChange={ (event: React.ChangeEvent<HTMLInputElement>) => setScore(+event.target.value) }
                    />
                </div>
            </div>

            <div className="row justify-content-around mt-5">
                <div className="col-6">
                    <label htmlFor="exampleFormControlInput1" className="form-label">Answer</label>
                    <input type="text" className="form-control" name="answer" placeholder="Answer .... "
                           value = {answer}
                           onChange={ (event: React.ChangeEvent<HTMLInputElement>) => setAnswer(event.target.value) }
                    />
                </div>
                <div className="col-6">
                    <label htmlFor="exampleFormControlInput1" className="form-label">Description</label>
                    <textarea className="form-control" name="description" placeholder="Description .... "
                           value = {description}
                           onChange={ (event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value) }
                    />
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-6">
                    <label className="form-label">Task Category</label>
                    <select name="categoryList" className="form-control" onChange={ (event : React.ChangeEvent<HTMLSelectElement>) => setCategoryId(event.target.value) }>
                        {
                            categoryList.length ? 
                                categoryList?.map( item => {
                                    return (<option value={item.uid} key={item.uid}>{item.title}</option> )
                                } )
                            : null
                        }
                    </select>
                </div>
            </div>

            <div className="row justify-content-around mt-5">
                <div className="col-6">
                    <div className="input-group mb-3">
                        <input type="file" className="form-control" onChange={ _titleImageChangeHandler }/>
                        <label className="input-group-text">Title Image</label>
                    </div>
                </div>
                <div className="col-6">
                    <div className="input-group mb-3">
                        <input type="file" className="form-control" onChange={ _taskFileChangeHandler }/>
                        <label className="input-group-text">Task File</label>
                    </div>
                </div>
            </div>

            <div className="row justify-content-around mt-5">
                <div className="col">
                    <button className="btn btn-primary w-100 btn-lg" onClick={_addTaksHandler}> Add Task </button>
                </div>
            </div>

            <SaveAlert success={successfullySaved} unsuccess={saveError}/>

        </div>
    )
}