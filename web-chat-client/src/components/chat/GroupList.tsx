import {useEffect, useState} from 'react';
import {Search, Users, Plus} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {GroupChatModal} from './GroupChatModal';
import {useChat} from "../../hooks/useChat.ts";
import {useUser} from "../../hooks/useUser.ts";

export function GroupList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const {groupChats, fetchGroupChats, setActiveChat} = useChat();
    const {searchUsers, users} = useUser();

    useEffect(() => {
        const fetchData = async () => {
            await fetchGroupChats();
            await searchUsers("");
        }

        fetchData()
    }, []);

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-4">
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                        <input
                            type="search"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus size={20}/>
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto">
                {groupChats && groupChats.map((chat, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setActiveChat(chat);
                            navigate(`/chats/${chat._id}`);
                        }}
                        className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        <div className="flex items-center space-x-4">
                            <div
                                className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <Users className="text-blue-600 dark:text-blue-400" size={24}/>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium">{chat.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {chat.participants.length} members
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <GroupChatModal users={users} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </div>
    );
}