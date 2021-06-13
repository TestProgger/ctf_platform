import React , {useState} from 'react';

import './SignUp.css';

interface IProps{
    signUpHandler : Function
}

export const SignUp = ({ signUpHandler } : IProps) => {

    const [ firstName , setFirtsName ] = useState<string>('');
    const [ lastName , setLastName ] = useState<string>(''); 
    const [gradeBookNumber , setGrageBookNumber] = useState<string>('');
    const [ password , setPassword] = useState<string>('');
    const [ confirmPassword , setConfirmPassword] = useState<string>('');




    return (
        <div className = "sign_up__container">

            <div className = "sign_up__title" > <p className = "h3"> Sign In </p> </div>

            <div className = "sign_up__form">
                <label  className="form-label">First Name</label>
                <div className="">
                    <input type="text" className="form_input"
                            placeholder="First ...."
                            value = { firstName }
                            onChange = { ( event : React.ChangeEvent<HTMLInputElement> ) => setFirtsName(event.target.value) }
                            />
                </div>

            </div>

            <div className = "sign_up__form">
                <label  className="form-label">Last Name</label>
                <div className="">
                    <input type="text" className="form_input"
                            placeholder="Last ...."
                            value = { lastName }
                            onChange = { ( event : React.ChangeEvent<HTMLInputElement> ) => setLastName(event.target.value) }
                            />
                </div>

            </div>

            <div className = "sign_up__form">
                <label  className="form-label">Grade Book number</label>
                <div className="">
                    <input type="text" className="form_input"
                            placeholder="Number ..."
                            value = { gradeBookNumber }
                            onChange = { ( event : React.ChangeEvent<HTMLInputElement> ) => setGrageBookNumber(event.target.value) }
                            />
                </div>

            </div>

            <div className = "sign_up__form">
                <label  className="form-label"> Password </label>
                <div className="">
                    <input type="password" className="form_input"  
                            placeholder = "******"
                            value = { password }
                            onChange = { (event : React.ChangeEvent<HTMLInputElement>) => setPassword( event.target.value  )   }
                            />
                </div>

            </div>

            <div className = "sign_up__form">
                <label  className="form-label">Confirm Password</label>
                <div className="">
                    <input type="password" className="form_input"
                            placeholder="******"
                            value = { confirmPassword }
                            onChange = { ( event : React.ChangeEvent<HTMLInputElement> ) => setConfirmPassword(event.target.value) }
                            />
                </div>

            </div>

            

            <div className = "sign_up__button_block">
                <button onClick = {() => signUpHandler({ firstName , lastName , gradeBookNumber  , password , confirmPassword } )}  className = "sign_up__button"> Sign Up </button>
            </div>

        </div> 
    
    
        );
}