import { useReducer } from "react";

const initialState = {
    value:'',
    isTouched: false
}

const inputReducer = (state, action) => {
    let newState = {...state};

    if(action.type === 'NEW_VAL'){
        newState.value = action.payload;
    }

    if(action.type === 'BLUR'){
        newState.isTouched = true;
    }

    if(action.type === 'RESET'){
        newState.value = '';
        newState.isTouched = false;
    }

    return newState;
}

const useInput = (validator, minLength) => {

    const [inputState, dispatch] = useReducer(inputReducer, initialState);

    const inputIsValid = validator(inputState.value, minLength);

    const inputIsInvalid = !inputIsValid && inputState.isTouched;

    const inputChangeHandler = (event) => {
        dispatch({type:'NEW_VAL', payload:event.target.value});
    }

    const inputBlurHandler = () => {
        dispatch({type:'BLUR'});
    }

    const inputResetHandler = () => {
        dispatch({type:'RESET'});
    }

    return {
        value: inputState.value,
        isValid: inputIsValid,
        hasError: inputIsInvalid,
        inputChangeHandler,
        inputBlurHandler,
        inputResetHandler
    };
}

export default useInput;