import {useEffect, useState} from 'react';
import {Search, MessageSquare, CircleUser} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useUser} from "../../hooks/useUser.ts";
import {useChat} from "../../hooks/useChat.ts";
import {useAuth} from "../../hooks/useAuth.ts";
import {useChatParticipants} from "../../hooks/useChatParticipant.ts";

export function UserList() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const {createChat, fetchDirectChats} = useChat();
    const {searchUsers, users} = useUser();
    const {utils , participants , actions} = useChatParticipants();
    const {user} = useAuth()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                await searchUsers(searchQuery);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [searchQuery]);

    const startChat = async (userId: string) => {
        const isAlreadyChat = utils.isParticipant(userId);
        console.log(isAlreadyChat)
        console.log(participants)

        // if (alreadyCreatedChat.length > 0) {
        //     navigate(`/chats/${alreadyCreatedChat[0]!._id}`);
        // } else {
        //     const chat = await createChat({
        //         type: 'DIRECT',
        //         participants: [userId]
        //     });
        //
        //     navigate(`/chats/${chat?._id}`);
        // }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="search"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                </div>
            </div>

            <div className="overflow-y-auto">
                {users && users.filter((item) => item._id !== user?._id).map((user) => (
                    <div
                        key={user._id}
                        className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => startChat(user._id)}
                    >
                        <div className="flex items-center space-x-4">
                            <CircleUser className="text-blue-600 dark:text-blue-400" size={25}/>
                            <div className="flex-1">
                                <h3 className="font-medium">{user.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                            <MessageSquare className="text-gray-400" size={20}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}