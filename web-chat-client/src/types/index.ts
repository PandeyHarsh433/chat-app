export interface AuthState {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export interface PrismaSession {
    id: string;
    userId: string;
    expiresAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
}

export interface ChatState {
    chats: Chat[];
    messages: Record<string, IMessage[]>;
    activeChat: string | null;
    isConnected: boolean;
    typingUsers: Record<string, boolean>;
    setActiveChat: (chatId: string | null) => void;
    createChat: (data: Partial<Chat>) => Promise<Chat>;
    sendMessage: (chatId: string, content: string) => Promise<void>;
    markAsRead: (chatId: string, messageIds: string[]) => Promise<void>;
    getMessages: (chatId: string) => IMessage[];
    fetchChats: () => Promise<void>;
    fetchMessages: (chatId: string, before?: Date) => Promise<void>;
    startTyping: (chatId: string) => void;
    stopTyping: (chatId: string) => void;
}

export interface Session {
    id: string;
    userId: string;
    expiresAt: Date;
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export enum ChatType {
    DIRECT = 'DIRECT',
    GROUP = 'GROUP'
}

export interface BaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    isOnline: boolean;
    lastSeen: Date;
}

export interface Session {
    id: string;
    userId: string;
    expiresAt: Date;
    user: User;
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'chats' | 'createdGroups'>;
export type UserUpdateInput = Partial<Omit<User, 'id' | 'email' | 'password' | 'role'>>;

export interface Chat {
    _id: string;
    name?: string;
    type: 'DIRECT' | 'GROUP';
    participants: string [];
    lastMessage?: {
        messageId: string;
        timestamp: Date;
    },
    creatorId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateChat = Pick<Chat, 'type' | 'participants' | 'name'>

export type ChatCreateInput = {
    type: ChatType;
    name?: string;
    creatorId?: string;
    participantIds: string[];
};

export interface ChatParticipant extends BaseModel {
    userId: string;
    chatId: string;
    joinedAt: Date;
    user: User;
}

export type ChatParticipantCreateInput = {
    userId: string;
    chatId: string;
};

export interface IMessage {
    id: string;
    content: string;
    chatId: string;
    type?: 'TEXT' | 'VIDEO';
    sender: {
        id: string;
        email: string;
        name: string;
        role: string;
    },
    createdAt: Date;
    updatedAt: Date;
    readBy: { userId: string; readAt: Date }[];
}

export interface VideoCallState {
    // activeCall: VideoCall | null;
    // callHistory: VideoCall[];
    startCall: (params: {
        chatId: string;
        participants: string[];
        stream: MediaStream;
    }) => Promise<void>;
    endCall: (chatId: string) => void;
    updateStream: (chatId: string, stream: MediaStream) => void;
}