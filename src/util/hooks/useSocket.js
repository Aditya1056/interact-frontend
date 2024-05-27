import { useState, useEffect, useCallback, useRef } from "react";

import io from "socket.io-client";

import { useAuthContext } from "../../store/auth-context";
import { useToastContext } from "../../store/toast-context";
import { queryClient } from '../../util/helpers/http';

const useSocket = () => {

    const auth = useAuthContext();

    const toast = useToastContext();

    const [socket, setSocket] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [notifications, setNotifications] = useState({});
    const [onCall, setOnCall] = useState(false);
    const [outgoingCall, setOutgoingCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callingChat, setCallingChat] = useState(null);
    const [callingUser, setCallingUser] = useState(null);
    const [remoteOffer, setRemoteOffer] = useState(null);

    const setRemoteOfferHandler = (offer) => {
        setRemoteOffer(offer);
    }

    const closeRemoteOfferHandler = () => {
        setRemoteOffer(null);
    }
    
    const setCallingUserHandler = (name) => {
        setCallingUser(name);
    }

    const closeCallingUserHandler = () => {
        setCallingUser(null);
    }

    const setCallingChatHandler = (chatId) => {
        setCallingChat(chatId);
    }

    const closeCallingChatHandler = () => {
        setCallingChat(null);
    }
    
    const selectChatHandler = (chatId) => {
        setSelectedChat(chatId);
    }
    
    const setOnCallHandler = () => {
        setOnCall(true);
    }

    const closeOnCallHandler = () => {
        setOnCall(false);
    }

    const setOutgoingCallHandler = () => {
        setOutgoingCall(true);
    }

    const closeOutgoingCallHandler = () => {
        setOutgoingCall(false);
    }

    const setIncomingCallHandler = () => {
        setIncomingCall(true);
    }

    const closeIncomingCallHandler = () => {
        setIncomingCall(false);
    }

    const setNotificationHandler = (chatId) => {
        setNotifications((prevNotifications) => {
            let updatedNotifications = {...prevNotifications};
            if(updatedNotifications[chatId]){
                updatedNotifications[chatId] += 1;
            }
            else{
                updatedNotifications[chatId] = 1;
            }
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            return updatedNotifications;
        });
    }
    
    const clearNotificationHandler = (chatId) => {
        setNotifications((prevNotifications) => {
            let updatedNotifications = {...prevNotifications};
            if(updatedNotifications[chatId]){
                delete updatedNotifications[chatId];
            }
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            return updatedNotifications;
        });
    }
    
    const messageReceiveHandler = useCallback((chatId) => {

        if(selectedChat !== chatId){
            queryClient.invalidateQueries({queryKey:['chat-list', auth.userId]});
            setNotificationHandler(chatId);
        }
        
        if(selectedChat === chatId){
            queryClient.invalidateQueries({queryKey:['chat-list', auth.userId]});
            queryClient.invalidateQueries({queryKey:['chat', selectedChat]});
        }
    }, [selectedChat, auth.userId]);

    const incomingCallHandler = useCallback((data) => {
        if(onCall){
            return socket.emit('user-busy', {to:data.from});
        }
        setIncomingCall(true);
        setOnCall(true);
        setCallingChat(data.from);
        setCallingUser(data.fromName);
        setRemoteOffer(data.remoteOffer);
    }, []);

    const userBusyHandler = useCallback((data) => {
        toast.openToast('fail', `User is on another call`);
        setOnCall(false);
        setOutgoingCall(false);
        setIncomingCall(false);
        setCallingChat(null);
        setCallingUser(null);
        setRemoteOffer(null);
    }, []);

    const leaveCallHandler = useCallback((data) => {
        setOnCall(false);
        setOutgoingCall(false);
        setIncomingCall(false);
        setCallingChat(null);
        setCallingUser(null);
        setRemoteOffer(null);
    }, []);

    const callRejectedHandler = useCallback((data) => {
        toast.openToast('fail', `Call rejected`);
        setOnCall(false);
        setOutgoingCall(false);
        setIncomingCall(false);
        setCallingChat(null);
        setCallingUser(null);
        setRemoteOffer(null);
    }, []);
    
    useEffect(() => {

        if(auth.isLoggedIn){

            if(localStorage.getItem('notifications')){
                const storedNotifications = JSON.parse(localStorage.getItem('notifications'));
                setNotifications(storedNotifications);
            }

            const socketInstance = io(import.meta.env.VITE_BACKEND_URL ,{
                query:{
                    userId: auth.userId
                }
            });
            
            socketInstance.on('connect', () => {
                setSocket(socketInstance);
            });
            
            socketInstance.on("onlineUsers", (userSocketMap) => {
                setOnlineUsers(userSocketMap);
            });

            return () => {
                socketInstance.close();
            };
        }
        else{
            if(socket){
                socket.close();
            }
            setSocket(null);
            setSelectedChat(null);
            setOnCall(false);
            setIncomingCall(false);
            setOutgoingCall(false);
            setCallingChat(null);
            setCallingUser(null);
            setRemoteOffer(null);
            setOnlineUsers({});
            setNotifications({});
        }
    }, [auth.isLoggedIn, auth.userId]);

    useEffect(() => {
        if (socket) {

            socket.on("receive-message", messageReceiveHandler);

            socket.on('incoming-call', incomingCallHandler);

            return () => {
                socket.off("receive-message", messageReceiveHandler);
                socket.off("incoming-call", incomingCallHandler);
            };
        }
    }, [socket, messageReceiveHandler, incomingCallHandler]);

    useEffect(() => {

        if(socket){

            socket.on('user-busy', userBusyHandler);
            socket.on('leave-call', leaveCallHandler);
            socket.on("call-rejected", callRejectedHandler);
    
            return () => {
                socket.off("user-busy", userBusyHandler);
                socket.off("leave-call", leaveCallHandler);
                socket.off("call-rejected", callRejectedHandler);
            }
        }
    }, [socket, userBusyHandler, leaveCallHandler, callRejectedHandler]);

    return {
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
    };
}

export default useSocket;