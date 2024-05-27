import React, { useContext } from 'react';

export const AuthContext = React.createContext({
    isLoggedIn:false,
    token:null,
    userId:null,
    userImage:null,
    userName:null,
    userUsername:null,
    userJoined:null,
    login:() => {},
    logout:() => {},
    changeUserImage:() => {}
});

export const useAuthContext = () => {
    return useContext(AuthContext);
}

