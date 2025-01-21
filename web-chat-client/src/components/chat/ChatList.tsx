import {useNavigate} from 'react-router-dom';
import {useChat} from '../../hooks/useChat';
import {ChatListItem} from './ChatListItem';

export function ChatList() {
    const navigate = useNavigate();
    const {
        chats,
        activeChat,
        setActiveChat,
    } = useChat();

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col w-[20rem] shadow-lg p-1">
            <div className="flex-1 overflow-y-auto">
                {chats && chats.map((chat) => (
                    <ChatListItem
                        key={chat._id}
                        chat={chat}
                        isActive={activeChat?._id === chat._id}
                        onClick={() => {
                            setActiveChat(chat);
                            navigate(`/chats/${chat._id}`);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}