import { useState } from "react";

import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from "react-router-dom";

import { BiSolidChat } from "react-icons/bi";
import { SiGnuprivacyguard } from "react-icons/si";

import styles from './SignupForm.module.css';

import useInput from "../../util/hooks/useInput";
import { useToastContext } from "../../store/toast-context";

import Input from '../../util/UI/Input/Input';
import Loading from "../../util/UI/Loading/Loading";

import { minLengthValidator } from '../../util/helpers/validators';
import { fetchRequest, postRequest } from "../../util/helpers/http";
import ErrorBlock from "../../util/UI/ErrorBlock/ErrorBlock";

const SignupForm = (props) => {

    const navigate = useNavigate();

    const toast = useToastContext();

    const [passwordType, setPasswordType] = useState('password');
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAvatars, setShowAvatars] = useState(false);

    const showPasswordHandler = () => {
        setPasswordType('text');
    }

    const hidePasswordHandler = () => {
        setPasswordType('password');
    }

    const selectAvatarHandler = (image) => {
        setSelectedImage(image);
    }

    const showAvatarsHandler = () => {
        setShowAvatars(true);
    }

    const hideAvatarsHandler = () => {
        setShowAvatars(false);
    }

    const { 
        data:fetchedData, 
        isPending: fetchIsPending, 
        isError: fetchIsError, 
        error:fetchError 
    } = useQuery({
        queryKey:['avatars'],
        queryFn:({signal}) => {
            return fetchRequest({
                signal,
                url: import.meta.env.VITE_BACKEND_URL + '/api/users/avatars',
            });
        }
    });

    const { 
        value: nameValue, 
        isValid: nameIsValid,
        hasError: nameIsInvalid,
        inputChangeHandler: nameChangeHandler,
        inputBlurHandler: nameBlurHandler,
        inputResetHandler: nameResetHandler
    } = useInput(minLengthValidator, 1);

    const { 
        value: emailValue, 
        isValid: emailIsValid,
        hasError: emailIsInvalid,
        inputChangeHandler: emailChangeHandler,
        inputBlurHandler: emailBlurHandler,
        inputResetHandler: emailResetHandler
    } = useInput(minLengthValidator, 6);

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

    const {data:checkData,isLoading:checkIsPending, isError:checkIsError} = useQuery({
        queryKey:['username-status', usernameValue],
        queryFn:({signal}) => {
            return fetchRequest({
                signal,
                url:import.meta.env.VITE_BACKEND_URL + '/api/users/usernames?search=' + usernameValue,
            });
        },
        enabled: usernameValue.trim().length >=3,
        refetchOnWindowFocus:false
    });

    const { mutate, isPending } = useMutation({
        mutationFn:postRequest,
        onSuccess:(data) => {
            nameResetHandler();
            emailResetHandler();
            usernameResetHandler();
            passwordResetHandler();
            setSelectedImage(null);
            toast.openToast('success', 'Successfully registered!');
            navigate('/');
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
        }
    });

    let message = null;

    if(checkIsPending){
        message="Checking...";
    }

    if(checkIsError){
        message="Not available";
    }

    if(!checkIsPending && !checkIsError && checkData){
        message="Available";
    }

    const firstStageIsValid = nameIsValid && 
                            emailIsValid && 
                            usernameIsValid && 
                            passwordIsValid && 
                            message === 'Available';

    const formIsValid = firstStageIsValid && selectedImage;

    const signupSubmitHandler = (event) => {
        event.preventDefault();
        const data = {
            name:nameValue.trim(),
            email:emailValue.trim().toLowerCase(),
            username: usernameValue.trim(),
            password: passwordValue.trim(),
            image: selectedImage
        };
        mutate({
            url:import.meta.env.VITE_BACKEND_URL + '/api/users/signup',
            method:'POST',
            body:JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        });
    }

    const classes = styles['avatar'];

    const selectedClasses = styles['avatar'] + ' ' + styles['selected']; 

    return (
        <div className={styles['signup']} >
            <h1>
                <BiSolidChat className={styles['chat-icon']} /> 
                Interact
            </h1>
            <div className={styles['signup-content']}>
                <h2>
                    Register 
                    <SiGnuprivacyguard className={styles['signup-icon']} />
                </h2>
                <form 
                    onSubmit={signupSubmitHandler} 
                    className={styles['signup-form']} 
                >
                    {
                        !showAvatars && 
                        <>
                            <Input
                                type="text" 
                                id="name" 
                                label="Name" 
                                showLabel={true} 
                                value={nameValue} 
                                InvalidInput={nameIsInvalid} 
                                onChange={nameChangeHandler} 
                                onBlur={nameBlurHandler} 
                                errorContent="Name cannot be empty!" 
                            />
                            <Input
                                type="email" 
                                id="email" 
                                label="Email" 
                                showLabel={true} 
                                value={emailValue} 
                                InvalidInput={emailIsInvalid} 
                                onChange={emailChangeHandler} 
                                onBlur={emailBlurHandler} 
                                errorContent="Email must be at least 6 characters!"  
                            />
                            <Input
                                type="text" 
                                id="username" 
                                label="Username (to login)" 
                                showLabel={true} 
                                value={usernameValue} 
                                InvalidInput={usernameIsInvalid} 
                                onChange={usernameChangeHandler} 
                                onBlur={usernameBlurHandler} 
                                errorContent="Username must be at least 3 characters!" 
                                message={message} 
                            />
                            <Input
                                type={passwordType}  
                                id="password" 
                                label="Password" 
                                showLabel={true} 
                                value={passwordValue} 
                                InvalidInput={passwordIsInvalid} 
                                onChange={passwordChangeHandler} 
                                onBlur={passwordBlurHandler} 
                                showPassword={showPasswordHandler} 
                                hidePassword={hidePasswordHandler} 
                                errorContent="Password must be at least 6 characters!" 
                            />
                            <div className={styles['form-actions']} >
                                <button 
                                    type="button" 
                                    disabled={!firstStageIsValid} 
                                    onClick={showAvatarsHandler} 
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    }
                    {
                        showAvatars && 
                        <>
                            <div className={styles['avatars-container']} >
                                <p>Select an Avatar</p>
                                <div className={styles['avatars']} >
                                    {
                                        (!fetchIsPending && !fetchIsError && fetchedData) && 
                                        fetchedData.avatars.map((avatar, index) => {
                                            return (
                                                <div 
                                                    key={index} 
                                                    onClick={() => {selectAvatarHandler(avatar)}} 
                                                    className={selectedImage === avatar ? selectedClasses : classes} 
                                                >
                                                    <img 
                                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${avatar}`} 
                                                        alt={avatar}  
                                                    />
                                                </div>
                                            );
                                        })
                                    }
                                    {
                                        fetchIsPending && 
                                        <Loading size="10px" />
                                    }
                                    {
                                        fetchIsError && 
                                        <ErrorBlock content={fetchError.message} width="80%" />
                                    }
                                </div>
                            </div>
                            <div className={styles['form-actions']} >
                                {
                                    !isPending && 
                                    <>
                                        <button 
                                            type="button" 
                                            className={styles['back-btn']} 
                                            onClick={hideAvatarsHandler} 
                                        >
                                            Back
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={!formIsValid} 
                                        >
                                            Register
                                        </button>
                                    </>
                                }
                                {
                                    isPending && <Loading size="10px" />
                                }
                            </div>
                        </>
                    }
                </form>
                <div className={styles['login-link']} >
                    <p>Already have an account?</p>
                    <Link to='/'>Login</Link>
                </div>
            </div>
        </div>
    );
}

export default SignupForm;