export const minLengthValidator = (value, minLength) => {

    if(value && value.trim().length >= minLength){
        return true;
    }

    return false;
}