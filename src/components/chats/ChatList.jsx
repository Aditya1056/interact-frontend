import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import styles from './ChatList.module.css';

import { useAuthContext } from '../../store/auth-context';
import { useSocketContext } from '../../store/socket-context';

import ChatItem from './ChatItem';

import Loading from '../../util/UI/Loading/Loading';
import ErrorBlock from '../../util/UI/ErrorBlock/ErrorBlock';

import { fetchRequest } from '../../util/helpers/http';

const ChatList = (props) => {

    const auth = useAuthContext();

    const {socket} = useSocketContext();

    const [searchInputValue, setSearchInputValue] = useState('');

    const searchInputChangeHandler = (event) => {
        setSearchInputValue(event.target.value);
    }

    const { data, isPending, isError, error } = useQuery({
        queryKey:['chat-list', auth.userId],
        queryFn:({signal}) => {
            return fetchRequest({
                signal,
                url:import.meta.env.VITE_BACKEND_URL + '/api/chats',
                headers:{
                    'Authorization': 'Bearer ' + auth.token
                }
            });
        }
    });

    const { data:searchData, isLoading:searchIsPending, isError:searchIsError, error:searchError } = useQuery({
        queryKey:['chat-list', auth.userId, searchInputValue.trim()],
        queryFn:({signal}) => {
            return fetchRequest({
                signal,
                url:import.meta.env.VITE_BACKEND_URL + `/api/chats/search?term=${searchInputValue.trim()}`,
                headers:{
                    'Authorization': 'Bearer ' + auth.token
                }
            });
        },
        enabled: searchInputValue.trim().length > 0,
        refetchOnWindowFocus:false
    });

    useEffect(() => {
        if(data){
            const chatIds = data.map((chat) => {
                return chat._id;
            });
            if(socket){
                socket.emit("join-rooms", chatIds);
            }
        }
    }, [data, socket]);

    return (
        <>
            <div className={styles['chat-search']} >
                <input 
                    type="text" 
                    placeholder="Search by name or group name..." 
                    onChange={searchInputChangeHandler} 
                    value={searchInputValue} 
                />
                {
                    searchInputValue.trim().length > 0 && 
                    <p>search results for "{searchInputValue.trim()}"</p>
                }
            </div>
            <div className={styles['chat-list']} >
                {
                    (isPending || searchIsPending) && 
                    <Loading size="10px" margin="2rem" />
                }
                {
                    isError && 
                    <ErrorBlock content={error.message} width="85%" />
                }
                {
                    searchIsError && 
                    <ErrorBlock content={searchError.message} width="85%" />
                }
                {
                    (
                        !isPending && 
                        !isError && 
                        !searchIsPending && 
                        !searchIsError &&  
                        searchInputValue.trim().length === 0 && data
                    ) 
                    && 
                    <>
                        {
                            data.length === 0 && 
                            <div className={styles['chat-list__fallback']}>
                                No chats found!
                            </div>
                        }
                        {
                            data.length !== 0 &&  
                            <ul>
                                {
                                    data.map((chat) => {
                                        return (
                                            <ChatItem 
                                                key={chat._id} 
                                                chatId={chat._id} 
                                                isGroup={chat.isGroup} 
                                                groupName={chat.groupName} 
                                                groupAdmin={chat.groupAdmin} 
                                                users={chat.users} 
                                                lastMessage={chat.latestMessage ? chat.latestMessage.content : null} 
                                                lastSenderId={chat.latestMessage ? chat.latestMessage.sender : null} 
                                                updatedAt={chat.updatedAt} 
                                            />
                                        );
                                    })
                                }
                            </ul>
                        }
                    </>
                }
                {
                    (
                        !isPending && 
                        !isError && 
                        !searchIsPending && 
                        !searchIsError &&  
                        searchInputValue.trim().length > 0 && searchData
                    ) 
                    && 
                    <>
                        {
                            searchData.length === 0 && 
                            <div className={styles['chat-list__fallback']}>
                                No chats found!
                            </div>
                        }
                        {
                            searchData.length !== 0 &&  
                            <ul>
                                {
                                    searchData.map((chat) => {
                                        return (
                                            <ChatItem 
                                                key={chat._id} 
                                                chatId={chat._id} 
                                                isGroup={chat.isGroup} 
                                                groupName={chat.groupName} 
                                                groupAdmin={chat.groupAdmin} 
                                                users={chat.users} 
                                                lastMessage={chat.latestMessage ? chat.latestMessage.content : null} 
                                                lastSenderId={chat.latestMessage ? chat.latestMessage.sender : null} 
                                                updatedAt={chat.updatedAt} 
                                            />
                                        );
                                    })
                                }
                            </ul>
                        }
                    </>
                }
            </div>
        </>
    );
}

export default ChatList;