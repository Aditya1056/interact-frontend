import styles from './Loading.module.css';

const Loading = (props) => {

    const marginTop = props.margin ? props.margin : undefined;

    return (
        <div className={styles['loading']} style={{marginTop: marginTop}} >
            <div className={styles['loading-content']} >
                <div className={styles['dot-1']} style={{width: props.size, height:props.size}} />
                <div className={styles['dot-2']} style={{width: props.size, height:props.size}} />
                <div className={styles['dot-3']} style={{width: props.size, height:props.size}} />
            </div>
        </div>
    );
}

export default Loading;