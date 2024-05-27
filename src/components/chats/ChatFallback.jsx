import Lottie from 'lottie-react';

import { PiHandWavingThin } from "react-icons/pi";

import styles from './ChatFallback.module.css';

import { useAuthContext } from '../../store/auth-context';

import chatData from '../../assets/chat.json';

const ChatFallback = () => {

    const auth = useAuthContext();

    return (
        <div className={styles['chat-fallback']} >
            <div className={styles['chat-fallback__content']} >
                <h1>
                    Hello {auth.userName} 
                    <PiHandWavingThin className={styles['hand-wave-icon']} />
                </h1>
                <div className={styles['welcome-text']} >
                    Welcome to Interact!
                </div>
                <Lottie animationData={chatData} loop={false} className={styles['chat-gif']} />
                <p>Select a chat to start messaging!</p>
            </div>
        </div>
    );
}

export default ChatFallback;