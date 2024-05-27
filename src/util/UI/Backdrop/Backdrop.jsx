import ReactDOM from 'react-dom';

import styles from './Backdrop.module.css';

const Backdrop = (props) => {

    const backdropContent = (
        <div className={styles['backdrop']} onClick={props.onClick} />
    );

    return ReactDOM.createPortal(backdropContent, document.getElementById('backdrop'));
}

export default Backdrop;