import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";

import { IoClose } from "react-icons/io5";
import { BsFillSendFill } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";
import { MdEdit } from "react-icons/md";

import styles from './SingleProfile.module.css';

import Backdrop from '../../util/UI/Backdrop/Backdrop';
import Loading from "../../util/UI/Loading/Loading";
import ErrorBlock from "../../util/UI/ErrorBlock/ErrorBlock";

import { useAuthContext } from "../../store/auth-context";
import { useToastContext } from "../../store/toast-context";

import { formatUserProfileDate } from "../../util/helpers/date-format";
import { fetchRequest, postRequest } from "../../util/helpers/http";

const authorProfile = {
    initial:{x: '-110%'},
    animate:{x:'0%'},
    exit:{x:'-110%'}
}

const userProfile = {
    initial:{x: '110%'},
    animate:{x:'0%'},
    exit:{x:'110%'}
}

const SingleProfile = (props) => {

    const auth = useAuthContext();
    const toast = useToastContext();

    const [openAvatars, setOpenAvatars] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const toggleAvatarHandler = () => {
        setOpenAvatars(prev => !prev);
        setSelectedAvatar(null);
    }

    const selectAvatarHandler = (image) => {
        setSelectedAvatar(image);
    }

    let profileClasses = styles['single-profile'];
    let closeClasses = styles['single-profile__close'];

    if(props.author){
        profileClasses += ' ' + styles['left-slide'];
        closeClasses += ' ' + styles['right-stay'];
    }

    let avatarClasses = styles['single-avatar'];
    let selectedAvatarClasses = styles['single-avatar'] + ' ' + styles['selected'];

    const user = props.user;

    const {data, isPending, isError, error} = useQuery({
        queryKey:['avatars'],
        queryFn:({signal}) => {
            return fetchRequest({
                signal,
                url: import.meta.env.VITE_BACKEND_URL + '/api/users/avatars'
            });
        }
    });

    const {mutate, isPending: postIsPending} = useMutation({
        mutationFn:postRequest,
        onSuccess:() => {
            toast.openToast('success', "Avatar changed successfully!");
            auth.changeUserImage(selectedAvatar);
            setOpenAvatars(false);
            setSelectedAvatar(null);
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
        }
    });

    const avatarSubmitHandler = () => {
        mutate({
            url: import.meta.env.VITE_BACKEND_URL + '/api/users/change-avatar',
            method:'PATCH',
            body:JSON.stringify({image: selectedAvatar}),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.token
            }
        });
    }

    return (
        <>
            <Backdrop/>
            <motion.div 
                className={profileClasses} 
                initial={props.author ? authorProfile.initial : userProfile.initial} 
                animate={props.author ? authorProfile.animate : userProfile.animate} 
                exit={props.author ? authorProfile.exit : userProfile.exit} 
                transition={{duration:0.25, type:"tween"}} 
            >
                <div className={closeClasses} >
                    <button onClick={props.closeProfile} >
                        <IoClose className={styles['close-icon']} />
                    </button>
                </div>
                <div className={styles['single-profile__content']} >
                    <img 
                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${user.image}`} 
                        alt={user.name} 
                    />
                    <h2 className={styles['name']} >{user.name}</h2> 
                    <p className={styles['username']} >@{user.username}</p>
                    {
                        props.author && 
                        <div className={styles['change-avatar']} >
                            <button 
                                className={styles['change-avatar-btn']} 
                                onClick={toggleAvatarHandler} 
                            >
                                {
                                    !openAvatars && 
                                    <>
                                        <MdEdit className={styles['edit-icon']} /> Change Avatar
                                    </>
                                }
                                {
                                    openAvatars && 
                                    <>
                                        <IoClose className={styles['cancel-icon']} /> Cancel
                                    </>
                                }
                            </button>
                            {
                                openAvatars && 
                                <>
                                    {
                                        isPending && <Loading size="8px" margin="1rem" />
                                    }
                                    {
                                        isError && <ErrorBlock content={error.message} width="85%" />
                                    }
                                    {
                                        !isPending && !isError && data && 
                                        <div className={styles['avatars-container']} >
                                            <div className={styles['all-avatars']} >
                                                {
                                                    data.avatars.map((avatar, index) => {
                                                        return (
                                                            <div 
                                                                className={selectedAvatar === avatar ? selectedAvatarClasses : avatarClasses} 
                                                                onClick={() => {selectAvatarHandler(avatar)}} 
                                                                key={index} 
                                                            >
                                                                <img 
                                                                    src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${avatar}`} 
                                                                    alt={`image-${index}`} 
                                                                />
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                            {
                                                postIsPending && <Loading size="8px" margin="1rem" />
                                            }
                                            {
                                                !postIsPending && 
                                                <button 
                                                    className={styles['submit-avatar-btn']} 
                                                    disabled={!selectedAvatar} 
                                                    onClick={avatarSubmitHandler}
                                                >
                                                    Save 
                                                </button>
                                            }
                                        </div>
                                    }
                                </>
                            }
                        </div>
                    }
                    <p className={styles['date']} >Joined on {formatUserProfileDate(user.createdAt)}</p>
                    {
                        !props.author && 
                        <Link to={`mailto:${user.email}`} className={styles['mail']} >
                            Send mail <BsFillSendFill className={styles['send-icon']} />
                        </Link>
                    }
                    {
                        props.author && 
                        <button 
                            className={styles['logout']} 
                            onClick={user.logout} 
                        >
                            Logout <AiOutlineLogout className={styles['logout-icon']} />
                        </button>
                    }
                </div>
            </motion.div>
        </>
    );
}

export default SingleProfile;