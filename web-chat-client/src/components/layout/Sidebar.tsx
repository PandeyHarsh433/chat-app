import { NavLink } from 'react-router-dom';
import { MessageSquare, Users, UserPlus } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-16 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="h-full flex flex-col items-center py-4 space-y-4">
        <NavLink
          to="/chats"
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`
          }
        >
          <MessageSquare size={24} />
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`
          }
        >
          <UserPlus size={24} />
        </NavLink>
        <NavLink
          to="/groups"
          className={({ isActive }) =>
            `p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`
          }
        >
          <Users size={24} />
        </NavLink>
      </div>
    </div>
  );
}