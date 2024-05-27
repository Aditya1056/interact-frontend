import React, { useContext } from "react";

export const SocketContext = React.createContext({
    socket:null,
    onlineUsers:null,
    notifications:null,
    selectChatHandler:() => {},
    clearNotificationHandler:() => {},
    onCall:false,
    incomingCall:false,
    outgoingCall:false,
    callingChat:null,
    callingUser:null,
    remoteOffer:null,
    setOnCallHandler:() => {},
    closeOnCallHandler:() => {},
    setIncomingCallHandler:() => {},
    closeIncomingCallHandler:() => {},
    setOutgoingCallHandler:() => {},
    closeOutgoingCallHandler:() => {},
    setCallingChatHandler:() => {},
    closeCallingChatHandler:() => {},
    setCallingUserHandler:() => {},
    closeCallingUserHandler:() => {},
    setRemoteOfferHandler:() => {},
    closeRemoteOfferHandler:() => {}
});

export const useSocketContext = () => {
    return useContext(SocketContext);
}
