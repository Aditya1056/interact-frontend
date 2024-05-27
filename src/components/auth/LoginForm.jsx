import { useState } from "react";

import { Link , useNavigate} from "react-router-dom";
import { useMutation } from '@tanstack/react-query';

import { AiOutlineLogin } from "react-icons/ai";
import { BiSolidChat } from "react-icons/bi";

import styles from './LoginForm.module.css';

import useInput from "../../util/hooks/useInput";

import { useAuthContext } from "../../store/auth-context";
import { useToastContext } from "../../store/toast-context";

import Input from '../../util/UI/Input/Input';
import Loading from "../../util/UI/Loading/Loading";

import { minLengthValidator } from '../../util/helpers/validators';
import { postRequest } from "../../util/helpers/http";

const LoginForm = (props) => {

    const navigate = useNavigate();

    const auth = useAuthContext();
    const toast = useToastContext();

    const [passwordType, setPasswordType] = useState('password');

    const showPasswordHandler = () => {
        setPasswordType('text');
    }

    const hidePasswordHandler = () => {
        setPasswordType('password');
    }

    const { 
        value: usernameValue, 
        isValid: usernameIsValid,
        hasError: usernameIsInvalid,
        inputChangeHandler: usernameChangeHandler,
        inputBlurHandler: usernameBlurHandler,
        inputResetHandler: usernameResetHandler
    } = useInput(minLengthValidator, 3);

    const { 
        value: passwordValue, 
        isValid: passwordIsValid,
        hasError: passwordIsInvalid,
        inputChangeHandler: passwordChangeHandler,
        inputBlurHandler: passwordBlurHandler,
        inputResetHandler: passwordResetHandler
    } = useInput(minLengthValidator, 6);

    const {mutate, isPending} = useMutation({
        mutationFn: postRequest,
        onSuccess:(data) => {
            usernameResetHandler();
            passwordResetHandler();
            auth.login(data.token, data.userId, data.userImage, data.name, data.username, data.joined, data.expiration);
            toast.openToast('success', 'Login Successful');
            navigate('/chats');
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
        }
    });

    const formIsValid = usernameIsValid && passwordIsValid;

    const loginSubmitHandler = (event) => {
        event.preventDefault();
        const data = {
            username: usernameValue.trim(),
            password: passwordValue.trim()
        };
        mutate({
            url: import.meta.env.VITE_BACKEND_URL + '/api/users/login',
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        });
    }

    return (
        <div className={styles['login']} >
            <h1>
                <BiSolidChat className={styles['chat-icon']} />
                Interact
            </h1>
            <div className={styles['login-content']}>
                <h2>
                    Login
                    <AiOutlineLogin className={styles['login-icon']} />
                </h2>
                <form 
                    onSubmit={loginSubmitHandler} 
                    className={styles['login-form']}
                >
                    <Input
                        type="text" 
                        id="username" 
                        label="Username" 
                        showLabel={false} 
                        placeholder="Enter your username..." 
                        value={usernameValue} 
                        InvalidInput={usernameIsInvalid} 
                        onChange={usernameChangeHandler} 
                        onBlur={usernameBlurHandler} 
                        errorContent="Username must be at least 3 characters!"  
                    />
                    <Input
                        type={passwordType}  
                        id="password" 
                        label="Password" 
                        showLabel={false} 
                        placeholder="Enter your password..." 
                        value={passwordValue} 
                        InvalidInput={passwordIsInvalid} 
                        onChange={passwordChangeHandler} 
                        onBlur={passwordBlurHandler} 
                        showPassword={showPasswordHandler} 
                        hidePassword={hidePasswordHandler} 
                        errorContent="Password must be at least 6 characters!" 
                    />
                    <div className={styles['form-actions']} >
                        {
                            isPending && <Loading size="10px" />
                        }
                        {
                            !isPending && 
                            <button type="submit" disabled={!formIsValid}>Login</button>
                        }
                    </div>
                </form>
                <div className={styles['signup-link']} >
                    <p>Don't have an account?</p>
                    <Link to='/signup'>Register</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;