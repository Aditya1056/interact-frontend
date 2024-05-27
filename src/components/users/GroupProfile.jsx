import { useState } from 'react';

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { IoClose } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import { FaUsers } from "react-icons/fa";
import { TiUserAdd } from "react-icons/ti";
import { MdDelete } from "react-icons/md";
import { RiErrorWarningFill } from "react-icons/ri";

import styles from './GroupProfile.module.css';

import AddParticipants from '../chats/AddParticipants';
import GroupUserItem from './GroupUserItem';

import Backdrop from '../../util/UI/Backdrop/Backdrop';
import Confirm from '../../util/UI/Confirm/Confirm';

import groupImage from '../../assets/group.png';

import { useAuthContext } from '../../store/auth-context';
import { useToastContext } from '../../store/toast-context';

import { formatUserProfileDate } from '../../util/helpers/date-format';
import { postRequest, queryClient } from '../../util/helpers/http';

const GroupProfile = (props) => {

    const auth = useAuthContext();

    const toast = useToastContext();

    const navigate = useNavigate();

    const [showConfirm, setShowConfirm] = useState(false);
    const [showAddParticipants, setShowAddParticipants] = useState(false);

    const openConfirmHandler = () => {
        setShowConfirm(true);
    }

    const closeConfirmHandler = () => {
        setShowConfirm(false);
    }

    const openAddParticipantHandler = () => {
        setShowAddParticipants(true)
    }

    const closeAddParticipantHandler = () => {
        setShowAddParticipants(false);
    }

    const users = props.users;

    const admin = props.groupAdmin;

    const existingUsers = users.map((user) => {
        return {
            userId: user._id,
            username:user.username,
            userImage:user.image
        };
    });
    
    const {mutate:deleteGroupMutate, isPending:deleteGroupIsPending} = useMutation({
        mutationFn:postRequest,
        onSuccess:() => {
            queryClient.invalidateQueries({queryKey:['chat-list', auth.userId]});
            toast.openToast('success', `${props.groupName} group deleted successfully!`);
            closeConfirmHandler();
            navigate('/chats');
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
        }
    });
    
    const deleteGroupHandler = () => {
        deleteGroupMutate({
            url:import.meta.env.VITE_BACKEND_URL + `/api/chats/${props.chatId}`,
            method:'DELETE',
            body:JSON.stringify({}),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + auth.token
            }
        });
    }

    return (
        <>
            <Backdrop onClick={props.closeProfile} />
            <AnimatePresence>
                {
                    showConfirm && 
                    <Confirm 
                        header={`Delete group ${props.groupName}?`} 
                        message={`${props.groupName} group will be deleted permanently for all members in the group!`} 
                        onClose={closeConfirmHandler} 
                        onConfirm={deleteGroupHandler} 
                        isPending={deleteGroupIsPending} 
                    />
                }
                {
                    showAddParticipants && 
                    <AddParticipants 
                        users={existingUsers} 
                        chatId={props.chatId} 
                        closeModal={closeAddParticipantHandler} 
                        groupName={props.groupName} 
                    />
                }
            </AnimatePresence>
            <motion.div 
                className={styles['group-profile']} 
                initial={{x:'110%'}} 
                animate={{x:'0%'}} 
                exit={{x:'110%'}} 
                transition={{duration:0.25, type:"tween"}} 
            >
                <div className={styles['group-profile__close']} >
                    <button onClick={props.closeProfile} >
                        <IoClose className={styles['close-icon']} />
                    </button>
                </div>
                <div className={styles['group-profile__content']} >
                    <img 
                        src={groupImage} 
                        alt={props.groupName} 
                    />
                    <h2 className={styles['name']} >{props.groupName}</h2> 
                    <p className={styles['members']} >
                        <GoDotFill className={styles['dot-icon']} /> {props.groupSize} members
                    </p>
                    <p className={styles['date']} >Created on {formatUserProfileDate(props.createdAt)}</p>
                    <p className={styles['members-header']} >
                        <FaUsers className={styles['group-icon']} /> 
                        Participants ({users.length})
                    </p>
                    <div className={styles['group-participants']} >
                        {
                            users.map((user, index) => {
                                return (
                                    <GroupUserItem 
                                        key={index} 
                                        user={user} 
                                        admin={admin} 
                                        chatId={props.chatId} 
                                        groupName={props.groupName} 
                                    />
                                );
                            })
                        }
                    </div>
                    {
                        auth.userId === admin._id && 
                        <div className={styles['group-actions']} >
                            <button 
                                className={styles['member-add-btn']} 
                                onClick={openAddParticipantHandler} 
                            >
                                Add Participant <TiUserAdd className={styles['add-user-icon']} />
                            </button>
                            <button 
                                className={styles['group-delete-btn']} 
                                onClick={openConfirmHandler} 
                            >
                                Delete Group <MdDelete className={styles['delete-icon']} />
                            </button>
                            <p>
                                <RiErrorWarningFill className={styles['warning-icon']} /> Group will be deleted permanently for all members in the group!
                            </p>
                        </div>
                    }
                </div>
            </motion.div>
        </>
    );
}

export default GroupProfile;