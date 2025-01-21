import React, {useState} from 'react';
import {X} from 'lucide-react';
import {useAuth} from "../../hooks/useAuth.ts";
import {User} from "../../types";
import {useChat} from "../../hooks/useChat.ts";

interface GroupChatModalProps {
    isOpen: boolean;
    users: User[]
    onClose: () => void;
}

export function GroupChatModal({isOpen, onClose, users}: GroupChatModalProps) {
    const [groupName, setGroupName] = useState<string>('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const {user: currentUser} = useAuth();
    const {createChat} = useChat();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (groupName && selectedUsers.length > 0) {
            await createChat({
                type: 'GROUP',
                name: groupName,
                participants: [...selectedUsers],
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Create Group Chat</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24}/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Select Members</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {users
                                .filter((user) => user._id !== currentUser?._id)
                                .map((user) => (
                                    <label
                                        key={user._id}
                                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers([...selectedUsers, user._id]);
                                                } else {
                                                    setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                                                }
                                            }}
                                            className="text-blue-600 rounded-full p-2"
                                        />
                                        <span>{user.name.toLocaleUpperCase()}</span>
                                    </label>
                                ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                        Create Group
                    </button>
                </form>
            </div>
        </div>
    );
}