import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { IoSearchOutline } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";

import styles from './AddParticipants.module.css';

import Loading from '../../util/UI/Loading/Loading';

import { useAuthContext } from '../../store/auth-context';
import { useToastContext } from '../../store/toast-context';

import { postRequest, queryClient } from '../../util/helpers/http';

const AddParticipants = (props) => {

    const [inputValue, setInputValue] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchedUsers, setSeachedUsers] = useState([]);

    const auth = useAuthContext();
    const toast = useToastContext();

    const {mutate:searchMutate, isPending:searchIsPending} = useMutation({
        mutationFn:postRequest,
        onSuccess:(data) => {
            setSeachedUsers(data.users);
            setInputValue('');
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
            setSeachedUsers([]);
        }
    });

    const {mutate, isPending} = useMutation({
        mutationFn:postRequest,
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['chat', props.chatId]});
            toast.openToast('success', 'Users added successfully!');
            props.closeModal();
        },
        onError:(err) => {
            toast.openToast('fail', err.message);
        }
    });

    const inputChangeHandler = (event) => {
        setInputValue(event.target.value);
    }

    const addUserHandler = (index) => {
        setSelectedUsers((prevSelectedUsers) => {
            let updatedUsers = [...prevSelectedUsers];
            updatedUsers.push(searchedUsers[index]);
            setSeachedUsers((prevSearchedUsers) => {
                let updatedSearchedUsers = [...prevSearchedUsers];
                updatedSearchedUsers.splice(index, 1);
                return updatedSearchedUsers;
            });
            return updatedUsers;
        });
    }

    const removeUserHandler = (index) => {
        setSelectedUsers((prevSelectedUsers) => {
            const updatedUsers = [...prevSelectedUsers];
            updatedUsers.splice(index,1);
            return updatedUsers;
        });
    }

    const searchUserHandler = (event) => {
        event.preventDefault();
        searchMutate({
            url: import.meta.env.VITE_BACKEND_URL + '/api/users',
            method:'POST',
            body:JSON.stringify({
                selectedUsers,
                existingUsers:props.users,
                username:inputValue.trim()
            }),
            headers:{
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + auth.token
            }
        });
    }

    const addParticipantsHandler = (event) => {
        event.preventDefault();
        const users = selectedUsers.map((selectedUser) => {
            return selectedUser.userId;
        });
        const data = {users};
        
        mutate({
            url:import.meta.env.VITE_BACKEND_URL + `/api/chats/add-user/${props.chatId}`,
            method:'POST',
            body:JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + auth.token
            }
        });
    }

    return (
        <div className={styles['add-users-container']} >
            <motion.div 
                className={styles['add-users']} 
                initial={{opacity:0, y:'50%'}} 
                animate={{opacity:1, y:'0%'}} 
                exit={{opacity:0, y:'50%'}} 
                transition={{duration:0.2, type:"tween"}} 
            >
                <div className={styles['search-user']} >
                    <div className={styles['group-name']} >
                        <input 
                            type='text' 
                            value={props.groupName} 
                            disabled={true} 
                        />
                    </div>
                    <form onSubmit={searchUserHandler} >
                        <input 
                            type='text' 
                            placeholder='Search by username' 
                            value={inputValue} 
                            onChange={inputChangeHandler} 
                        />
                        <button 
                            type="submit" 
                            disabled={inputValue.trim().length === 0}
                        >
                            <IoSearchOutline />
                        </button>
                    </form>
                    {
                        searchIsPending && 
                        <Loading size="8px" margin="5px" />
                    }
                        {
                            !searchIsPending && searchedUsers.length > 0 && 
                            <div className={styles['searched-users']} >
                                {
                                    searchedUsers.map((searchedUser, index) => {
                                        return (
                                            <div className={styles['searched-user']} key={index} >
                                                <p>{searchedUser.username}</p>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {addUserHandler(index)}} 
                                                    title="Add user" 
                                                >
                                                    <GoPlus className={styles['plus-icon']} />
                                                </button>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        }
                </div>
                <div className={styles['selected-users']}>
                    <p><FaUsers className={styles['users-icon']} />Selected Participants</p>
                    <div className={styles['selected_users_content']} >
                        {
                            selectedUsers.length == 0 && 
                            <p>No users selected!</p>
                        }
                        {
                            selectedUsers.length > 0 && 
                            selectedUsers.map((selectedUser, index) => {
                                return (
                                    <div key={index} className={styles['selected_user']} >
                                        <img 
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${selectedUser.userImage}`} 
                                            alt='profile' 
                                        />
                                        <p>{selectedUser.username}</p>
                                        <button 
                                            type="button" 
                                            onClick={()=> {removeUserHandler(index)}} 
                                            title="Remove user"
                                        >
                                            <RxCross2 className={styles['cross-icon']} />
                                        </button>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                <div className={styles['add-users__actions']} >
                    <form onSubmit={addParticipantsHandler} >
                        {
                            isPending && 
                            <Loading size="10px" />
                        }
                        {
                            !isPending && 
                            <>
                                <button 
                                    type="button" 
                                    className={styles['cancel-btn']} 
                                    onClick={props.closeModal} 
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles['add-btn']} 
                                    disabled={selectedUsers.length == 0}
                                >
                                    Add
                                </button>
                            </>
                        }
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default AddParticipants;