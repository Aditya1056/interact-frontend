import { RxCrossCircled } from "react-icons/rx";

import styles from './ErrorBlock.module.css';

const ErrorBlock = (props) => {
    return (
        <div className={styles['error-block']}>
            <div className={styles['error-content']} style={{width:props.width}} >
                <p>
                    <RxCrossCircled className={styles['fail-icon']} />
                    {props.content} 
                </p>
            </div>
        </div>
    );
}

export default ErrorBlock;