import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Chats from './pages/chats/Chats';
import Chat from './pages/chats/Chat';
import ChatWelcome from './pages/chats/ChatWelcome';

import { AuthContext } from './store/auth-context';
import { useToastContext } from './store/toast-context';

import useAuth from './util/hooks/useAuth';

import { queryClient } from './util/helpers/http';
import Loading from './util/UI/Loading/Loading';
import ProtectedRoute from './util/helpers/ProtectedRoute';
import ProtectedAuthRoute from './util/helpers/ProtectedAuthRoute';
import Notification from './util/UI/Notification/Notification';

import SocketContextProvider from './util/Providers/SocketContextProvider';

const router = createBrowserRouter([
  {
    path: '/', 
    element:  <ProtectedAuthRoute component={<Login />} />
  },
  {
    path:'/signup', 
    element: <ProtectedAuthRoute component={<Signup />} />
  },
  {
    path:'/chats', 
    element: <ProtectedRoute component={<Chats />} />,
    children:[
      {
        index:true,
        element:<ProtectedRoute component={<ChatWelcome />} />
      },
      {
        path:':chatId',
        element: <ProtectedRoute component={<Chat />} />,
      }
    ]
  },
  {
    path:'*',
    element: (
      <div style={{textAlign: 'center', color: 'white', marginTop:'7rem'}} >
        <h1>Page Not Found!</h1>
      </div>
    )
  }
]);

function App() {

  const { token, userId, userImage, userName, userUsername, userJoined, login, logout, changeUserImage, isLoading } = useAuth();

  const toast = useToastContext();

  return (
    <>
      {
        isLoading && 
        <Loading size="15px" />
      }
      {
        !isLoading && 
        <QueryClientProvider client={queryClient} >
            <AuthContext.Provider
              value={{
                isLoggedIn: !!token,
                token,
                userId,
                userImage,
                userName,
                userUsername,
                userJoined,
                login,
                logout,
                changeUserImage,
              }}
            >
              <SocketContextProvider>
                <RouterProvider router={router} />
              </SocketContextProvider>
            </AuthContext.Provider>
        </QueryClientProvider>
      }
      <AnimatePresence>
        {
          toast.content && toast.status && 
          <Notification 
            status={toast.status} 
            content={toast.content} 
            onClick={toast.closeToast} 
          />
        }
      </AnimatePresence>
    </>
  );
}

export default App;
