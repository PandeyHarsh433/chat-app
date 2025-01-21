import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { UserList } from '../components/chat/UserList';

export function UsersPage() {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1">
          <UserList />
        </div>
      </div>
    </div>
  );
}