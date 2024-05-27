import { motion } from 'framer-motion';

import { CiCircleCheck } from "react-icons/ci";
import { RxCrossCircled } from "react-icons/rx";
import { GoXCircleFill } from "react-icons/go";

import styles from './Notification.module.css';

const Notification = (props) => {

    let classes = styles['notification'];

    let contentClasses = styles['notification-content'];

    if(props.status === 'success'){
        contentClasses += ' ' + styles['success'];
    }

    if(props.status === 'fail'){
        contentClasses += ' ' + styles['fail'];
    }

    return (
        <motion.div 
            className={classes} 
            initial={{y:'-100%'}}
            animate={{y:0}} 
            exit={{y:'-100%'}} 
            transition={{type:'spring', duration:0.2, bounce:0.4}} 
        >
            <div className={styles['undertext-hider']} >
                <div className={contentClasses} >
                    <p>
                        {
                            props.status === 'success' && 
                            <CiCircleCheck className={styles['success-icon']} />
                        }
                        {
                            props.status === 'fail' && 
                            <RxCrossCircled className={styles['fail-icon']} />
                        }
                        {props.content}
                    </p>
                    <GoXCircleFill className={styles['close-notification']} onClick={props.onClick} />
                </div>
            </div>
        </motion.div>
    );
}

export default Notification;