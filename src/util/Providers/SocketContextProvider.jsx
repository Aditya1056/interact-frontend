import { SocketContext } from "../../store/socket-context";

import useSocket from "../hooks/useSocket";

const SocketContextProvider = (props) => {
    
    const { 
            socket, 
            onlineUsers, 
            selectChatHandler, 
            clearNotificationHandler, 
            notifications, 
            onCall,
            incomingCall,
            outgoingCall,
            callingChat,
            callingUser,
            remoteOffer,
            setOnCallHandler,
            closeOnCallHandler,
            setIncomingCallHandler,
            closeIncomingCallHandler,
            setOutgoingCallHandler,
            closeOutgoingCallHandler,
            setCallingChatHandler,
            closeCallingChatHandler,
            setCallingUserHandler,
            closeCallingUserHandler,
            setRemoteOfferHandler,
            closeRemoteOfferHandler
    } = useSocket();

    return (
        <SocketContext.Provider
            value={{
                socket,
                onlineUsers,
                notifications,
                selectChatHandler,
                clearNotificationHandler,
                onCall,
                incomingCall,
                outgoingCall,
                callingChat,
                callingUser,
                remoteOffer,
                setOnCallHandler,
                closeOnCallHandler,
                setIncomingCallHandler,
                closeIncomingCallHandler,
                setOutgoingCallHandler,
                closeOutgoingCallHandler,
                setCallingChatHandler,
                closeCallingChatHandler,
                setCallingUserHandler,
                closeCallingUserHandler,
                setRemoteOfferHandler,
                closeRemoteOfferHandler
            }}
        >
        {props.children}
        </SocketContext.Provider>
    );
}

export default SocketContextProvider;