import {prisma} from '../services/prisma';
import type {User, Message} from '../types';

export async function createUser(data: Omit<User, 'id'>) {
    return prisma.user.create({
        data: {
            ...data,
            role: data.role || 'USER',
        },
    });
}

export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {email},
        include: {
            chats: {
                include: {
                    chat: true,
                },
            },
        },
    });
}

export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: {id},
    });
}

export async function updateUserStatus(userId: string, isOnline: boolean) {
    return prisma.user.update({
        where: {id: userId},
        data: {
            isOnline,
            lastSeen: new Date(),
        },
    });
}

export async function updateUserProfile(
    userId: string,
    data: Partial<Pick<User, 'name' | 'avatar'>>
) {
    return prisma.user.update({
        where: {id: userId},
        data,
    });
}

export async function createDirectChat(user1Id: string, user2Id: string) {
    // First check if a direct chat already exists between these users
    const existingChat = await prisma.chat.findFirst({
        where: {
            type: 'DIRECT',
            AND: [
                {participants: {some: {userId: user1Id}}},
                {participants: {some: {userId: user2Id}}},
            ],
        },
    });

    if (existingChat) {
        return existingChat;
    }

    return prisma.chat.create({
        data: {
            type: 'DIRECT',
            participants: {
                create: [
                    {userId: user1Id},
                    {userId: user2Id},
                ],
            },
        },
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
        },
    });
}

export async function createGroupChat(
    name: string,
    creatorId: string,
    participantIds: string[]
) {
    return prisma.chat.create({
        data: {
            type: 'GROUP',
            name,
            creatorId,
            participants: {
                create: [...new Set([creatorId, ...participantIds])].map((userId) => ({
                    userId,
                })),
            },
        },
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
        },
    });
}

export async function getChatById(chatId: string) {
    return prisma.chat.findUnique({
        where: {id: chatId},
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 50,
                include: {
                    sender: true,
                },
            },
        },
    });
}

export async function getChatsByUserId(userId: string) {
    return prisma.chat.findMany({
        where: {
            participants: {
                some: {
                    userId,
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
                include: {
                    sender: true,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
}

export async function addUserToGroupChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
        where: {id: chatId},
        include: {
            participants: true,
        },
    });

    if (!chat || chat.type !== 'GROUP') {
        throw new Error('Invalid chat');
    }

    return prisma.chatParticipant.create({
        data: {
            userId,
            chatId,
        },
        include: {
            user: true,
            chat: true,
        },
    });
}

export async function removeUserFromGroupChat(chatId: string, userId: string) {
    return prisma.chatParticipant.delete({
        where: {
            userId_chatId: {
                userId,
                chatId,
            },
        },
    });
}

export async function createMessage(data: Omit<Message, 'id'>) {
    const message = await prisma.message.create({
        data: {
            content: data.content,
            chat: {connect: {id: data.chatId}},
            sender: {connect: {id: data.senderId}},
        },
        include: {
            sender: true,
            chat: true,
        },
    });

    // Update chat's updatedAt
    await prisma.chat.update({
        where: {id: data.chatId},
        data: {updatedAt: new Date()},
    });

    return message;
}

export async function getMessagesByChatId(
    chatId: string,
    limit = 50,
    before?: Date
) {
    return prisma.message.findMany({
        where: {
            chatId,
            ...(before && {createdAt: {lt: before}}),
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
        include: {
            sender: true,
        },
    });
}

export async function isUserInChat(userId: string, chatId: string) {
    const participant = await prisma.chatParticipant.findUnique({
        where: {
            userId_chatId: {
                userId,
                chatId,
            },
        },
    });
    return !!participant;
}

export async function isUserAdmin(userId: string) {
    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {role: true},
    });
    return user?.role === 'ADMIN';
}

export async function getChatParticipants(chatId: string) {
    return prisma.chatParticipant.findMany({
        where: {chatId},
        include: {
            user: true,
        },
    });
}

export async function searchUsers(query: string) {
    return prisma.user.findMany({
        where: {
            OR: [
                {name: {contains: query, mode: 'insensitive'}},
                {email: {contains: query, mode: 'insensitive'}},
            ],
        },
        take: 10,
    });
}

export async function searchChats(userId: string, query: string) {
    return prisma.chat.findMany({
        where: {
            AND: [
                {
                    participants: {
                        some: {userId},
                    },
                },
                {
                    OR: [
                        {name: {contains: query, mode: 'insensitive'}},
                        {
                            participants: {
                                some: {
                                    user: {
                                        OR: [
                                            {name: {contains: query, mode: 'insensitive'}},
                                            {email: {contains: query, mode: 'insensitive'}},
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        },
        include: {
            participants: {
                include: {
                    user: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
        },
    });
}