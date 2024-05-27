import { useState, useEffect, useRef, useCallback } from 'react';

import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

import { HiPhoneMissedCall, HiPhone } from "react-icons/hi";
import { MdCallEnd } from "react-icons/md";
import { BiSolidCamera } from "react-icons/bi";
import { BiSolidCameraOff } from "react-icons/bi";
import { BsFillMicFill } from "react-icons/bs";
import { BsFillMicMuteFill } from "react-icons/bs";

import styles from './VideoCall.module.css';

import { useAuthContext } from '../../store/auth-context';
import { useSocketContext } from '../../store/socket-context';
import { useToastContext } from '../../store/toast-context';

import videoCallData from '../../assets/videoCall.json';

const VideoCall = (props) => {
    const auth = useAuthContext();
    const toast = useToastContext();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [cameraOn, setCameraOn] = useState(true);
    const [audioOn, setAudioOn] = useState(true);

    const myVideo = useRef(null);
    const remoteVideo = useRef(null);
    const peerConnection = useRef(null);

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setCameraOn(prev => !prev);
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setAudioOn(prev => !prev);
        }
    };

    const {
        socket,
        onCall,
        outgoingCall, 
        incomingCall, 
        callingChat,
        callingUser,
        remoteOffer,
        closeOnCallHandler,
        closeIncomingCallHandler,
        closeOutgoingCallHandler,
        closeCallingChatHandler,
        closeCallingUserHandler,
        setRemoteOfferHandler,
        closeRemoteOfferHandler
    } = useSocketContext();

    const stopStream = (stream) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const cleanUp = () => {
        stopStream(localStream);
        stopStream(remoteStream);
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setAudioOn(true);
        setCameraOn(true);
    };

    const callUser = async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", { to: callingChat, candidate: event.candidate });
                }
            };

            peerConnection.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            stream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, stream);
            });

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            socket.emit('outgoing-call', { to: callingChat, fromName: auth.userName, offer });

        } 
        catch (error) {
            toast.openToast("fail", error.message);
        }
    };

    const leaveCall = () => {
        socket.emit('leave-call', { to: callingChat });
        cleanUp();
        closeOnCallHandler();
        closeIncomingCallHandler();
        closeOutgoingCallHandler();
        closeCallingChatHandler();
        closeCallingUserHandler();
        closeRemoteOfferHandler();
    };

    const acceptCall = async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);

            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", { to: callingChat, candidate: event.candidate });
                }
            };

            peerConnection.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            stream.getTracks().forEach((track) => {
                peerConnection.current.addTrack(track, stream);
            });

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(remoteOffer));

            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit('accept-call', { to: callingChat, offer: answer });

            closeIncomingCallHandler();
        } 
        catch (error) {
            toast.openToast("fail", error.message);
        }
    };

    const rejectCall = () => {
        socket.emit('reject-call', { to: callingChat });
        cleanUp();
        closeOnCallHandler();
        closeIncomingCallHandler();
        closeOutgoingCallHandler();
        closeCallingChatHandler();
        closeCallingUserHandler();
        closeRemoteOfferHandler();
    };

    useEffect(() => {

        const callAcceptedHandler = (data) => {
            setRemoteOfferHandler(data.remoteOffer);
            closeOutgoingCallHandler();
            closeIncomingCallHandler();
            if (peerConnection.current) {
                peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.remoteOffer));
            }
        };

        const iceCandidateHandler = (data) => {
            if (peerConnection.current) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };

        if (socket) {
            socket.on("call-accepted", callAcceptedHandler);
            socket.on("ice-candidate-receive", iceCandidateHandler);
        }

        if (outgoingCall) {
            callUser();
        }
    }, []);

    useEffect(() => {
        if(!outgoingCall && !incomingCall && onCall){
            if (myVideo.current) {
                myVideo.current.srcObject = localStream;
            }
        }
    }, [outgoingCall, incomingCall, localStream, onCall]);

    useEffect(() => {
        if(!outgoingCall && !incomingCall && onCall){
            if (remoteVideo.current) {
                remoteVideo.current.srcObject = remoteStream;
            }
        }
    }, [outgoingCall, incomingCall, remoteStream, onCall]);

    useEffect(() => {
        if(!onCall){
            cleanUp();
        }
    }, [onCall]);

    const onCallContent = (
        <div className={styles['on-call']}>
            <div className={styles['my-stream']}>
                <video
                    muted 
                    ref={myVideo} 
                    playsInline 
                    autoPlay
                    className={styles['my-video']}
                />
            </div>
            <div className={styles['remote-stream']}>
                <video
                    ref={remoteVideo} 
                    playsInline 
                    autoPlay
                    className={styles['remote-video']} 
                />
            </div>
            <div className={styles['on-call-actions-container']} >
                <div className={styles['on-call-actions']}>
                    <button
                        className={styles['toggle-camera-btn']} 
                        title="toggle camera" 
                        onClick={toggleCamera} 
                    >
                        {
                            cameraOn ? 
                            <BiSolidCamera className={styles['camera-icon']} /> 
                            : 
                            <BiSolidCameraOff className={styles['camera-icon']} />
                        }
                    </button>
                    <button
                        className={styles['toggle-audio-btn']}
                        title="toggle audio" 
                        onClick={toggleAudio} 
                    >
                        {
                            audioOn ? 
                            <BsFillMicFill className={styles['audio-icon']} />
                            : 
                            <BsFillMicMuteFill className={styles['audio-icon']} /> 
                        }
                    </button>
                    <button
                        className={styles['end-call-btn']}
                        title="end"
                        onClick={leaveCall}
                    >
                        <MdCallEnd className={styles['leave-call-icon']} />
                    </button>
                </div>
            </div>
        </div>
    );

    const outgoingContent = (
        <div className={styles['outgoing-call']}>
            <h1>{callingUser}</h1>
            <Lottie animationData={videoCallData} loop={true} className={styles['video-call-gif']} />
            <p>Calling...</p>
            <div className={styles['outgoing-actions']}>
                <div className={styles['leave-call']}>
                    <button
                        className={styles['leave-call-btn']}
                        title="leave"
                        onClick={leaveCall}
                    >
                        <MdCallEnd className={styles['leave-call-icon']} />
                    </button>
                    <p>End</p>
                </div>
            </div>
        </div>
    );

    const incomingContent = (
        <div className={styles['incoming-call']}>
            <h1>{callingUser}</h1>
            <Lottie animationData={videoCallData} loop={true} className={styles['video-call-gif']} />
            <p>Incoming call...</p>
            <div className={styles['incoming-actions']}>
                <div className={styles['reject-call']}>
                    <button
                        className={styles['reject-call-btn']}
                        onClick={rejectCall}
                    >
                        <HiPhoneMissedCall className={styles['reject-call-icon']} />
                    </button>
                    <p>Reject</p>
                </div>
                <div className={styles['accept-call']}>
                    <button
                        className={styles['accept-call-btn']}
                        onClick={acceptCall}
                    >
                        <HiPhone className={styles['accept-call-icon']} />
                    </button>
                    <p>Accept</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles['video-call']}>
            <motion.div
                className={styles['video-call-content']}
                initial={{ y: '50%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '50%', opacity: 0 }}
                transition={{ duration: 0.5, type: "tween" }}
            >
                {(!incomingCall && !outgoingCall && onCall) && onCallContent}
                {outgoingCall && outgoingContent} 
                {incomingCall && incomingContent}
            </motion.div>
        </div>
    );
};

export default VideoCall;