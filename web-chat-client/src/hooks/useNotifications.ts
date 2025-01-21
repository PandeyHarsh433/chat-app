import {useEffect} from 'react';
import {useVideoCallStore} from '../store/useVideoCallStore';
import {useAuthStore} from '../store/useAuthStore';

export function useNotifications() {
    const {activeCall} = useVideoCallStore();
    const {user} = useAuthStore();

    useEffect(() => {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        const requestPermission = async () => {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Notification permission denied');
            }
        };

        requestPermission();
    }, []);

    useEffect(() => {
        if (activeCall && Notification.permission === 'granted') {
            if (!activeCall.participants.includes(user?._id || '')) {
                const notification = new Notification('Incoming Video Call', {
                    body: 'Someone is calling you...',
                    icon: '/video-call-icon.png',
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };

                return () => {
                    notification.close();
                };
            }
        }
    }, [activeCall, user?._id]);
}