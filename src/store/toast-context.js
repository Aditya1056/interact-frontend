import React, { useContext } from "react";

export const ToastContext = React.createContext({
    content:null,
    status:null,
    openToast:() => {},
    closeToast:() => {}
});

export const useToastContext = () => useContext(ToastContext);