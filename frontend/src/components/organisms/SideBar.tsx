import { LogOut, Users } from 'lucide-react';

export default function SideBar({
  room,
  username,
  users,
  onLeave,
}: {
  room: string;
  username: string;
  users: string[];
  onLeave: () => void;
}) {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Posible componente: <SidebarHeader /> */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Sala: {room}
        </h2>
        <p className="text-sm text-gray-400 mt-1">Usuario: {username}</p>
      </div>

      {/* Posible componente: <UserList /> */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Conectados ({users.length})
        </h3>
        <ul className="space-y-2">
          {users.map((user, index) => (
            <li key={`${user}-${index}`} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              {user} {user === username && '(tu)'}
            </li>
          ))}
        </ul>
      </div>

      {/* Posible componente: <SidebarFooter /> */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLeave}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </div>
  );
}
