import { useState } from 'react';

import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";

import { IoIosAdd } from "react-icons/io";

import styles from './AllChats.module.css';

import ChatList from './ChatList';
import CreateChat from './CreateChat';
import VideoCall from './VideoCall';
import SingleProfile from '../users/SingleProfile';

import { useAuthContext } from '../../store/auth-context';
import { useSocketContext } from '../../store/socket-context';

const AllChats = (props) => {

    const auth = useAuthContext();
    const location = useLocation();

    const { onCall, callingChat, callingUser } = useSocketContext();

    let chatNavClasses = styles['chat-nav'];
    let outletClasses = styles['outlet'];

    if(location.pathname === '/chats' || location.pathname === '/chats/'){
        chatNavClasses += ' ' + styles['increase'];
        outletClasses += ' ' + styles['decrease'];
    }
    else{
        chatNavClasses += ' ' + styles['decrease'];
        outletClasses += ' ' + styles['increase'];
    }

    const [newChat, setNewChat] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const openNewChatHandler = () => {
        setNewChat(true);
    }

    const closeNewChatHandler = () => {
        setNewChat(false);
    }

    const openProfileHandler = () => {
        setShowProfile(true);
    }
    
    const closeProfileHandler = () => {
        setShowProfile(false);
    }

    const userDetails = {
        name:auth.userName,
        username:auth.userUsername,
        image:auth.userImage,
        createdAt:auth.userJoined,
        logout:auth.logout
    }

    return (
        <>
            <AnimatePresence>
                {
                    newChat && 
                    <CreateChat closeModal={closeNewChatHandler} key={"create-chat"} />
                }
                {
                    showProfile && 
                    <SingleProfile 
                        user={userDetails} 
                        key={"single-profile"} 
                        closeProfile={closeProfileHandler} 
                        author 
                    />
                }
                {
                    (onCall && callingChat && callingUser) && 
                    <VideoCall key={"video-call"} />
                }
            </AnimatePresence>
            <div className={styles['all-container']} >
                <div className={styles['all-chats']} >
                    <div className={chatNavClasses}>
                        <div className={styles['profile-nav']}>
                            <div 
                                title='Your Profile' 
                                className={styles['profile-nav__image']} 
                                onClick={openProfileHandler} 
                            >
                                <img 
                                    src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${auth.userImage}`} 
                                    alt={'profile-pic'} 
                                />
                            </div>
                            <button type="button" onClick={openNewChatHandler} >
                                New Chat <IoIosAdd className={styles['add-icon']} />
                            </button>
                        </div>
                        <ChatList />
                    </div>
                    <div className={outletClasses}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    );
}

export default AllChats;