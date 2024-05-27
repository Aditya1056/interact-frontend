import ReactDOM from 'react-dom';

import { motion } from 'framer-motion';

import styles from './Confirm.module.css';

import Loading from '../Loading/Loading';

const Confirm = (props) => {

    const header = props.header;
    const message = props.message;

    const content = (
        <div className={styles['confirm-modal']} >
            <motion.div 
                initial={{y:'50%', opacity: 0}} 
                animate={{y:'0%', opacity:1}} 
                exit={{y:'50%', opacity:0}} 
                transition={{duration:0.25, type:'tween'}} 
                className={styles['confirm-content']} 
            > 
                <div className={styles['confirm-content__header']} >
                    <h3>{header}</h3>
                </div>
                <div className={styles['confirm-content__message']} >
                    <p>{message}</p>
                </div>
                <div className={styles['confirm-content__actions']} >
                    {
                        props.isPending && 
                        <Loading size="10px" />
                    }
                    { 
                        !props.isPending && 
                        <>
                            <button
                                type="button" 
                                className={styles['cancel-btn']} 
                                onClick={props.onClose} 
                            >
                                Cancel
                            </button>
                            <button
                                type="button" 
                                className={styles['confirm-btn']} 
                                onClick={props.onConfirm} 
                            >
                                Confirm
                            </button>
                        </>
                    }
                </div>
            </motion.div>
        </div>
    );

    return ReactDOM.createPortal(content, document.getElementById('modal'));
}

export default Confirm;