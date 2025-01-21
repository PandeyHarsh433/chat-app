import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { GroupList } from '../components/chat/GroupList';

export function GroupsPage() {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1">
          <GroupList />
        </div>
      </div>
    </div>
  );
}