import { useState, useEffect, useCallback } from 'react';

let closeToastTimer;

const useToast = () => {

    const [content, setContent] = useState(null);
    const [status, setStatus] = useState(null);

    const openToast = useCallback((toastStatus, toastContent) => {
        setStatus(toastStatus);
        setContent(toastContent);
    }, []);

    const closeToast = useCallback(() => {
        setContent(null);
        setStatus(null);
    }, []);

    useEffect(() => {
        if(content || status){
            closeToastTimer = setTimeout(closeToast, 5500);
        }
        else{
            clearTimeout(closeToastTimer);
        }
    }, [content, status]);

    return {
        content,
        status,
        openToast,
        closeToast
    };
}

export default useToast;