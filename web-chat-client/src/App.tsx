import {useEffect} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {useThemeStore} from './store/useThemeStore';
import {AuthPage} from './pages/AuthPage';
import {UsersPage} from './pages/UsersPage';
import {GroupsPage} from './pages/GroupsPage';
import {ChatList} from './components/chat/ChatList';
import {ChatWindow} from './components/chat/ChatWindow';
import {Header} from './components/layout/Header';
import {Sidebar} from './components/layout/Sidebar';
import {PrivateRoute} from "./components/auth/PrivateRoute.tsx";
import {PublicRoute} from "./components/auth/PublicRoute.tsx";
import {useSocketStore} from "./store/useSocketStore.ts";

function App() {
    const theme = useThemeStore((state) => state.theme);
    const {connectSocket, disconnectSocket} = useSocketStore();

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    useEffect(() => {
        connectSocket();
        return () => {
            disconnectSocket();
        };
    }, [connectSocket, disconnectSocket]);

    return (
        <BrowserRouter>
            <div className="h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Routes>
                    <Route
                        path="/auth"
                        element={
                            <PublicRoute>
                                <AuthPage/>
                            </PublicRoute>}
                    />

                    <Route path="/users" element={
                        <PrivateRoute>
                            <UsersPage/>
                        </PrivateRoute>
                    }/>

                    <Route path="/groups" element={
                        <PrivateRoute>
                            <GroupsPage/>
                        </PrivateRoute>
                    }/>

                    <Route path="/chats" element={
                        <PrivateRoute>
                            <div className="h-screen flex">
                                <Sidebar/>
                                <div className="flex-1 flex flex-col">
                                    <Header/>
                                    <div className="flex-1">
                                        <ChatList/>
                                    </div>
                                </div>
                            </div>
                        </PrivateRoute>
                    }/>

                    <Route path="/chats/:chatId" element={
                        <PrivateRoute>
                            <div className="h-[100vh] flex">
                                <Sidebar/>
                                <div className="flex-1 flex flex-col">
                                    <Header/>
                                    <div className="flex-1 flex">
                                        <div className="border-r dark:border-gray-800">
                                            <ChatList/>
                                        </div>
                                        <div className="flex-1">
                                            <ChatWindow/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PrivateRoute>
                    }/>

                    <Route path="*" element={<Navigate to="/auth" replace/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;