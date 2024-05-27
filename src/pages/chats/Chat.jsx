import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";

import SingleChat from "../../components/chats/SingleChat";
import Loading from "../../util/UI/Loading/Loading";
import ErrorBlock from "../../util/UI/ErrorBlock/ErrorBlock";

import { useAuthContext } from "../../store/auth-context";

import { fetchRequest } from "../../util/helpers/http";

const Chat = () => {

    const auth = useAuthContext();
    const chatId = useParams().chatId;

    const navigate = useNavigate();

    const {data, isPending, isError, error} = useQuery({
        queryKey:['chat', chatId],
        queryFn:({signal}) => {
            return fetchRequest({
                signal,
                url:import.meta.env.VITE_BACKEND_URL + '/api/chats/' + chatId,
                headers:{
                    'Authorization' : 'Bearer ' + auth.token
                }
            });
        }
    });

    return (
        <>
            {
                isPending && <Loading size="10px" margin="15rem" />
            }
            {
                isError && 
                <>
                    <ErrorBlock content={error.message} width="85%" />
                    <div 
                        style={{
                            width:"100%",
                            display:'flex',
                            justifyContent:"center",
                            alignItems:"center"
                        }}
                    >
                        <button 
                            onClick={() => {navigate('/chats')}} 
                            style={{
                                border:"none", 
                                padding:"7px 10px",
                                background:"rgb(63, 64, 105)",
                                color:"white",
                                fontSize:"16px",
                                borderRadius:"5px", 
                                marginTop:"3rem",
                                cursor:"pointer" 

                            }}
                        >
                            Go Back
                        </button>
                    </div>
                </>
            }
            {
                !isPending && !isError && <SingleChat chat={data.chat} messages={data.messages} />
            }
        </>
    );
}

export default Chat;