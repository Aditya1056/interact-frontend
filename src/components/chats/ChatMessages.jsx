import { useEffect, useRef } from "react";

import { FiLock } from "react-icons/fi";

import styles from './ChatMessages.module.css';

import { useAuthContext } from "../../store/auth-context";

import { formatMessageDate } from "../../util/helpers/date-format";

const ChatMessages = (props) => {

    const auth = useAuthContext();

    const messages = props.messages;

    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if(messagesContainerRef){
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    },[messages]);

    return (
        <div 
            className={styles['chat-messages']} 
            ref={messagesContainerRef} 
        >
            <div className={styles['encrypt-message']} >
                <p>
                    <FiLock className={styles['encrypt-icon']} />
                    messages are encrypted
                </p>
            </div>
            <div className={styles['chat-messages__content']} >
                <>
                    {
                        messages.length === 0 && 
                        <p className={styles['fallback-text']} >No messages yet!</p>
                    }
                    {
                        messages.length > 0 && 
                        messages.map((message, index) => {
                            return (
                                <div 
                                    key={index} 
                                    className={`${styles['chat-content']} ${message.sender._id === auth.userId ? styles['send'] : styles['receive']}`} 
                                >
                                    <div key={index} className={styles['chat-message']} >
                                        {
                                            props.isGroup && message.sender._id !== auth.userId && 
                                            <p className={styles['sender-name']} >
                                                <img src={`${import.meta.env.VITE_BACKEND_URL}/images/avatars/${message.sender.image}`} />
                                                {message.sender.name}
                                            </p>
                                        }
                                        <p className={styles['message-content']} >{message.content}</p>
                                        <p className={styles['message-date']} >{formatMessageDate(message.updatedAt)}</p>
                                    </div>
                                </div>
                            );
                        })
                    }
                </>
            </div>
        </div>
    );
}

export default ChatMessages;