import { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import { CiCircleRemove } from "react-icons/ci";
import { IoExitOutline } from "react-icons/io5";

import styles from './GroupUserItem.module.css';

import Confirm from '../../util/UI/Confirm/Confirm';

import { useAuthContext } from '../../store/auth-context';
import { useToastContext } from '../../store/toast-context';

import { postRequest, queryClient } from '../../util/helpers/http';

const GroupUserItem = (props) => {

    const user = props.user;
    const admin = props.admin;

    const auth = useAuthContext();
    const toast = useToastContext();

    const navigate = useNavigate();

    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const openRemoveConfirmHandler = () => {
        setShowRemoveConfirm(true);
    }

    const closeRemoveConfirmHandler = () => {
        setShowRemoveConfirm(false);
    }

    const openExitConfirmHandler = () => {
        setShowExitConfirm(true);
    }
    
    const closeExitConfirmHandler = () => {
        setShowExitConfirm(false);
    }

    const {mutate:userRemoveMutate, isPending:userRemoveIsPending} = useMutation({
        mutationFn:postRequest,
        onSuccess:() => {
            if(auth.userId === admin._id){
                queryClient.invalidateQueries({queryKey:['chat', props.chatId]});
                toast.openToast('success', `User removed successfully!`);
                closeRemoveConfirmHandler();
            }
            if(auth.userId !== admin._id){
                queryClient.invalidateQueries({queryKey:['chat-list', auth.userId]});
                toast.openToast('success', `exited ${props.groupName} successfully!`);
                closeExitConfirmHandler();
                navigate('/chats');
            }
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
        }
    });

    const deleteUserHandler = () => {
        userRemoveMutate({
            url:import.meta.env.VITE_BACKEND_URL + `/api/chats/${props.chatId}/${user._id}`,
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
        <AnimatePresence>
            {
                showExitConfirm && 
                <Confirm 
                    header={`Exit ${props.groupName}?`} 
                    message={`Do you really want to leave the group ${props.groupName}?`} 
                    onClose={closeExitConfirmHandler} 
                    onConfirm={deleteUserHandler} 
                    isPending={userRemoveIsPending} 
                />
            }
            {
                showRemoveConfirm && 
                <Confirm 
                    header={`Remove ${user.name} from ${props.groupName}?`}  
                    message={`Do you really want to remove ${user.name} from this group?`} 
                    onClose={closeRemoveConfirmHandler} 
                    onConfirm={deleteUserHandler} 
                    isPending={userRemoveIsPending} 
                />
            }
        </AnimatePresence>
        <div className={styles['participant']} >
            <div className={styles['participant-profile']} >
                <div className={styles['participant-image']} >
                    <img 
                        src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${user.image}`} 
                        alt={user.name} 
                    />
                </div>
                <div className={styles['participant-details']} >
                    <p className={styles['participant-details__name']} >
                        {user.name}
                    </p>
                    <p className={styles['participant-details__username']} >
                        @{user.username}
                    </p>
                </div>
            </div>
            <div className={styles['participant-actions']} >
                {
                    user._id === admin._id && auth.userId !== admin._id && 
                    <p>admin</p>
                }
                {
                    user._id === admin._id && auth.userId === admin._id && 
                    <p>admin (you)</p>
                }
                {
                    (user._id !== admin._id && auth.userId === admin._id) && 
                    <button 
                        type="button" 
                        title="remove user from group" 
                        onClick={openRemoveConfirmHandler}  
                        >
                        remove <CiCircleRemove className={styles['remove-icon']} />
                    </button>
                }
                {
                    (user._id === auth.userId && auth.userId !== admin._id) && 
                    <button 
                        type="button" 
                        title="leave from group" 
                        onClick={openExitConfirmHandler} 
                    >
                        exit <IoExitOutline className={styles['leave-icon']} />
                    </button>
                }
            </div>
        </div>
        </>
    );

}

export default GroupUserItem;