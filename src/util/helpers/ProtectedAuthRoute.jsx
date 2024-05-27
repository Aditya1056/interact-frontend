import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../../store/auth-context';

import Loading from '../UI/Loading/Loading';

const ProtectedAuthRoute = ({component: Component}) => {

    const [isLoading, setIsLoading] = useState(true);

    const auth = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(false);
        if(auth.isLoggedIn){
            navigate('/chats');
        }
    }, [auth.isLoggedIn]);

    return (
        <>
            {
                isLoading && <Loading size="15px" margin="8rem" />
            }
            {
                !isLoading && 
                Component
            }
        </>
    );
}

export default ProtectedAuthRoute;