import { useState, useEffect } from 'react';

import { useNavigate } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import { MdEmojiEmotions } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { IoVideocam } from "react-icons/io5";
import { IoVideocamOff } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { PiDotDuotone } from "react-icons/pi";
import { BiSolidSend } from "react-icons/bi";

import styles from './SingleChat.module.css';

import ChatMessages from './ChatMessages';
import SingleProfile from '../users/SingleProfile';
import GroupProfile from '../users/GroupProfile';

import groupImage from '../../assets/group.png';

import { useAuthContext } from '../../store/auth-context';
import { useToastContext } from '../../store/toast-context';
import { useSocketContext } from '../../store/socket-context';
import { postRequest, queryClient } from '../../util/helpers/http';

const SingleChat = (props) => {

    const auth = useAuthContext();

    const toast = useToastContext();

    const { 
            socket, 
            onlineUsers, 
            selectChatHandler, 
            clearNotificationHandler, 
            setOnCallHandler,
            setOutgoingCallHandler ,
            setCallingChatHandler,
            setCallingUserHandler
    } = useSocketContext();

    const navigate = useNavigate();

    const [showProfile, setShowProfile] = useState(false);
    const [messageValue, setMessageValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const openProfileHandler = () => {
        setShowProfile(true);
    }

    const closeProfileHandler = () => {
        setShowProfile(false);
    }

    const messageChangeHandler = (event) => {
        setMessageValue(event.target.value);
    }

    const keyDownHandler = (event) => {
        if(event.key === 'Enter' && !event.shiftKey){
            if(messageValue.trim().length > 0){
                messageSubmitHandler(event);
            }
            else{
                event.preventDefault();
            }
        }
    }

    const selectEmojiHandler = (emoji, event) => {
        const newMessage = messageValue + emoji.native;
        setMessageValue(newMessage);
        event.stopPropagation();
    }

    const openEmojiPicker = () => {
        setShowEmojiPicker(true);
    }
    
    const closeEmojiPicker = () => {
        setShowEmojiPicker(false);
    }

    const chat = props.chat;

    let chatUsers = props.chat.users;

    if(!chat.isGroup){
        chatUsers = props.chat.users.filter((user) => {
            return user._id !== auth.userId;
        });
    }

    let onlineStatus = null;

    if(!chat.isGroup){
        onlineStatus = onlineUsers[chatUsers[0]._id];
    }


    const {mutate, isPending} = useMutation({
        mutationFn:postRequest,
        onSuccess:(data) => {
            queryClient.invalidateQueries({queryKey:['chat', chat._id]});
            queryClient.invalidateQueries({queryKey:['chat-list', auth.userId]});
            setMessageValue('');
            setShowEmojiPicker(false);
            if(socket){
                socket.emit("send-message", chat._id);
            }
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
        }
    });

    useEffect(() => {
        selectChatHandler(chat._id);
        return () => selectChatHandler(null);
    }, [chat._id, selectChatHandler]);

    useEffect(() => {
        clearNotificationHandler(chat._id);
    }, [chat._id]);

    const messageSubmitHandler = (event) => {
        event.preventDefault();
        const data={
            message: messageValue.trim(),
            chatId:chat._id
        }
        mutate({
            url:import.meta.env.VITE_BACKEND_URL + '/api/chats/message',
            method:'POST',
            body:JSON.stringify(data),
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + auth.token
            }
        });
    }

    const videoCallHandler = () => {
        setOnCallHandler();
        setOutgoingCallHandler();
        setCallingChatHandler(chat._id);
        setCallingUserHandler(chatUsers[0].name);
    };

    return (
        <div className={styles['single-chat']} >
            <AnimatePresence>
                {
                    (showProfile && !chat.isGroup) && 
                    <SingleProfile user={chatUsers[0]} closeProfile={closeProfileHandler} />
                }
                {
                    (showProfile && chat.isGroup) && 
                    <GroupProfile 
                        chatId={chat._id} 
                        groupName={chat.groupName} 
                        groupAdmin={chat.groupAdmin} 
                        groupSize={chatUsers.length} 
                        createdAt={chat.createdAt} 
                        closeProfile={closeProfileHandler} 
                        users={chatUsers} 
                    />
                }
            </AnimatePresence>
            <div className={styles['single-chat__profile-header']} >
                <div className={styles['profile-header__profile']} >
                    <div className={styles['profile-header__back-btn']} >
                        <button 
                            type="button" 
                            onClick={() => {navigate('/chats')}} 
                        >
                            <IoArrowBack className={styles['back-arrow-icon']} /> 
                        </button>
                    </div>
                    <div className={styles['profile-header__image']} >
                        {   
                            !chat.isGroup && 
                            <img 
                                src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${chatUsers[0].image}`} 
                                alt={chatUsers[0].name} 
                                width="50px" 
                                height="50px" 
                            />
                        }
                        {   
                            chat.isGroup && 
                            <img 
                                src={groupImage} 
                                alt={chat.groupName} 
                                width="50px" 
                                height="50px" 
                            />
                        }
                    </div>
                    <div className={styles['profile-header__content']} >
                        {
                           chat.isGroup &&  
                           <p>{chat.groupName}</p>
                        }
                        {
                            !chat.isGroup && 
                            <p>{chatUsers[0].name}</p>
                        }
                        {
                            chat.isGroup && 
                            <i><PiDotDuotone className={styles['dot-icon']} />{chat.users.length} members</i>
                        }
                        {
                            !chat.isGroup && onlineStatus && 
                            <i className={styles['user-active']} ><PiDotDuotone className={styles['dot-icon']} />Online</i>
                        }
                        {
                            !chat.isGroup && !onlineStatus && 
                            <i><PiDotDuotone className={styles['dot-icon']} />Offline</i>
                        }
                    </div>
                </div>
                <div className={styles['profile-header__settings']} >
                    {
                        onlineStatus && 
                        <button 
                            type="button" 
                            title="video call" 
                            className={styles['video-call-btn']} 
                            onClick={videoCallHandler} 
                        >
                            <IoVideocam className={styles['video-call-icon']} />
                        </button>
                    }
                    {
                        !onlineStatus && 
                        <button 
                            type="button" 
                            title="not available" 
                            className={styles['video-call-btn']} 
                        >
                            <IoVideocamOff className={styles['video-call-icon']} />
                        </button>
                    }
                    <button 
                        type="button" 
                        title="about" 
                        className={styles['dots-btn']} 
                        onClick={openProfileHandler} 
                    >
                        <HiOutlineDotsVertical className={styles['dots-icon']} />
                    </button>
                </div>
            </div>
            <div className={styles['single-chat__messages']} >
                <ChatMessages messages={props.messages} isGroup={chat.isGroup} />
            </div>
            <div className={styles['single-chat__send-message']} >
                <form onSubmit={messageSubmitHandler} >
                    <div 
                        className={styles['emoji-picker']} 
                        title="send emoji" 
                        onClick={ showEmojiPicker ? closeEmojiPicker : openEmojiPicker} 
                    >
                        <MdEmojiEmotions className={styles['emoji-icon']} />
                        {
                            showEmojiPicker && 
                            <div className={styles['emojis']} onClick={event => event.stopPropagation()} >
                                <Picker 
                                    data={data} 
                                    theme="dark" 
                                    set="none" 
                                    onEmojiSelect={selectEmojiHandler} 
                                />
                            </div>
                        }
                    </div>
                    <textarea 
                        rows={3} 
                        placeholder="Enter a message..." 
                        value={messageValue} 
                        onChange={messageChangeHandler} 
                        onKeyDown={keyDownHandler} 
                    />
                    <button 
                        type="submit" 
                        title="send" 
                        disabled={messageValue.trim().length === 0 || isPending} 
                    >
                        <BiSolidSend />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SingleChat;