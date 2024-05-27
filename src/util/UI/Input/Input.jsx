import { MdErrorOutline } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import styles from './Input.module.css';

const Input = (props) => {

    let classes = styles['form-control'];

    if(props.InvalidInput){
        classes = classes + ' ' + styles['error'];
    }

    return (
        <div className={classes} >
            {
                props.showLabel && 
                <>
                    <label htmlFor={props.id} >
                        {props.label}
                        <sup>*</sup>
                    </label>
                    <br/>
                </>
            }
            <div className={styles['form-input']}>
                <input 
                    type={props.type} 
                    id={props.id} 
                    value={props.value} 
                    onChange={props.onChange} 
                    onBlur={props.onBlur} 
                    placeholder={props.placeholder ? props.placeholder : ''} 
                />
                {
                    (props.id === 'password' && props.type === 'password' && props.value.length > 0) && 
                    <div 
                        className={styles['show-btn']} 
                        onClick={props.showPassword} 
                    >
                        show
                    </div>
                }
                {
                    (props.id === 'password' && props.type === 'text' && props.value.length > 0) && 
                    <div 
                        className={styles['hide-btn']} 
                        onClick={props.hidePassword} 
                    >
                        hide
                    </div>
                }
            </div>
            {
                props.InvalidInput && 
                <p>
                    <MdErrorOutline className={styles['error-icon']} />
                    {props.errorContent}
                </p>
            }
            {
                !props.InvalidInput && props.message && props.value.length >= 3 && 
                <div className={styles['message']} >
                    {
                        props.message === 'Checking...' && 
                        <p className={styles['checking']} >
                            {props.message}
                        </p>
                    }
                    {
                        props.message === 'Not available' && 
                        <p>
                            <MdErrorOutline className={styles['error-icon']} />
                            {props.message}
                        </p>
                    }
                    {
                        props.message === 'Available' && 
                        <p className={styles['available']} >
                            <IoMdCheckmarkCircleOutline />
                            {props.message} 
                        </p>
                    }
                </div>
            }
        </div>
    );
}

export default Input;