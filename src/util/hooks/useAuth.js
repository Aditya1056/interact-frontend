import { useState, useEffect, useCallback } from 'react';

let logoutTimer;

const useAuth = () => {
    
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userImage, setUserImage] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userUsername, setUserUsername] = useState(null);
    const [userJoined, setUserJoined] = useState(null);
    const [tokenExpiration, setTokenExpiration] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = useCallback((token, userId, userImage, userName, userUsername, userJoined, expiration) => {
        
        setToken(token);
        setUserId(userId);
        setUserImage(userImage);
        setUserName(userName);
        setUserUsername(userUsername);
        setUserJoined(userJoined);
        const expirationDate = new Date(new Date().getTime() + expiration);
        setTokenExpiration(expirationDate);

        localStorage.setItem('userData', JSON.stringify({
            token: token,
            id: userId,
            image: userImage,
            name:userName,
            username:userUsername,
            joined:userJoined,
            expirationDate: expirationDate.toISOString()
        }));
    }, []);
    
    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        setUserImage(null);
        setUserName(null);
        setUserUsername(null);
        setUserJoined(null);
        setTokenExpiration(null);
        localStorage.removeItem('userData');
    }, []);

    const changeUserImage = useCallback((image) => {
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        storedUserData.image = image;
        localStorage.setItem('userData', JSON.stringify(storedUserData));
        setUserImage(image);
    }, []);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if(storedData && storedData.token && new Date(storedData.expirationDate) > new Date()){
            const timeRemaining = new Date(storedData.expirationDate).getTime() - new Date().getTime();
            login(storedData.token, storedData.id, storedData.image, storedData.name, storedData.username, storedData.joined, timeRemaining);
        }
        setIsLoading(false);
    },[login]);

    useEffect(() => {
        if(token && tokenExpiration){
            const timeRemaining = tokenExpiration.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, timeRemaining);
        }
        else{
            clearTimeout(logoutTimer);
        }
    }, [token, tokenExpiration, logout]);

    return {
        token,
        userId,
        userImage,
        userName,
        userUsername,
        userJoined,
        isLoading,
        login,
        logout,
        changeUserImage
    };
}

export default useAuth;