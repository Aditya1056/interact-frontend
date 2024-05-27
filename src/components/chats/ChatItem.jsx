import { NavLink } from 'react-router-dom';

import styles from './ChatItem.module.css';

import { useAuthContext } from '../../store/auth-context';
import { useSocketContext } from '../../store/socket-context';

import { formatDate } from '../../util/helpers/date-format';

import groupImage from '../../assets/group.png';

const ChatItem = (props) => {

    const auth = useAuthContext();

    const { notifications } = useSocketContext();

    let chatUsers = props.users;

    let notificationCount = null;

    let chatClasses = styles['chat-item'];

    if(notifications[props.chatId]){
        notificationCount = notifications[props.chatId] <= 100 ? notifications[props.chatId]: "100+";
        chatClasses += ' ' + styles['notification'];
    }

    if(!props.isGroup){
        chatUsers = props.users.filter((user) => {
            return user._id !== auth.userId;
        });
    }

    const date = formatDate(props.updatedAt);

    return (
        <>
            <li className={chatClasses} >
                <NavLink 
                    to={`/chats/${props.chatId}`} 
                    className={({isActive}) => {
                        return isActive ? styles['active'] : undefined;
                    }}
                    end={true} 
                >
                    <div className={styles['chat-item__image']} > 
                    {
                        props.isGroup && 
                        <img 
                            src={groupImage} 
                            alt={props.groupName} 
                        />
                    }
                    {
                        !props.isGroup && 
                        <img 
                            src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${chatUsers[0].image}`} 
                            alt={chatUsers[0].name} 
                        />
                    }
                    </div>
                    <div className={styles['chat-item__details']}>
                        <div className={styles['chat-item__details__header']}>
                            {
                                props.isGroup && 
                                <p>{props.groupName}</p>
                            }
                            {
                                !props.isGroup && 
                                <p>{chatUsers[0].name}</p>
                            }
                        </div>
                        <div className={styles['chat-item__details__footer']} >
                            {
                                props.lastMessage && 
                                <>
                                    {
                                        props.lastSenderId === auth.userId && 
                                        <p>you: {props.lastMessage}</p>
                                    }
                                    {
                                        props.lastSenderId !== auth.userId && 
                                        <p>{props.lastMessage}</p>
                                    }
                                </>
                            }
                            {
                                !props.lastMessage && 
                                <p>No messages yet!</p>
                            }
                        </div>
                    </div>
                    <div className={styles['chat-item__date']} >
                        {
                            notificationCount && 
                            <p className={styles['notification-count']} >{notificationCount}</p>
                        }
                        {
                            !notificationCount && 
                            <p>{date}</p>
                        }
                    </div>
                </NavLink>
            </li>
            <hr/>
        </>
    );

}

export default ChatItem;