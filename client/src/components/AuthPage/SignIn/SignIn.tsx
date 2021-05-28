import React, { InputHTMLAttributes, useState } from  'react';

import './SignIn.css';

interface IProps{
    signInHandler : Function
}


function SignIn({ signInHandler } : IProps){

    const [ password , setPassword] = useState<string>('');
    const [gradeBookNumber , setGrageBookNumber] = useState<string>('');

    



    return ( 
        <div className = "sign_in__container">

            <div className = "sign_in__title" > <p className = "h3"> Sign In </p> </div>

            <div className = "sign_in__form">
                <label  className="form-label">Grade Book number</label>
                <div className="">
                    <input type="text" className="form_input"
                            placeholder="Number ..."
                            value = { gradeBookNumber }
                            onChange = { ( event : React.ChangeEvent<HTMLInputElement> ) => setGrageBookNumber(event.target.value) }
                            />
                </div>

            </div>

            <div className = "sign_in__form">
                <label  className="form-label"> Password </label>
                <div className="">
                    <input type="password" className="form_input"  
                            placeholder = "******"
                            value = { password }
                            onChange = { (event : React.ChangeEvent<HTMLInputElement>) => setPassword( event.target.value  )   }
                            />
                </div>

            </div>

            <div className = "sign_in__button_block">
                <button onClick = {() => signInHandler(password , gradeBookNumber)}  className = "sing_in__button"> Sign In </button>
            </div>

        </div> 
    );
}

export default SignIn;