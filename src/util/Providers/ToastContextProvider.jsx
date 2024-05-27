import { ToastContext } from "../../store/toast-context";

import useToast from "../hooks/useToast";

const ToastContextProvider = (props) => {
    
    const {content, status, openToast, closeToast} = useToast();

    return (
      <ToastContext.Provider
        value={{
          status,
          content,
          openToast,
          closeToast
        }}
      >
        {props.children}
      </ToastContext.Provider>
    );
}

export default ToastContextProvider;