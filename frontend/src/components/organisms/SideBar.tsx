import { LogOut, Users } from 'lucide-react';
import { sideBarStyles } from '../../styles/classNames';

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
    <div className={sideBarStyles.panel}>
      {/* Posible componente: <SidebarHeader /> */}
      <div className={sideBarStyles.header}>
        <h2 className={sideBarStyles.title}>
          <Users className={sideBarStyles.titleIcon} />
          Sala: {room}
        </h2>
        <p className={sideBarStyles.username}>Usuario: {username}</p>
      </div>

      {/* Posible componente: <UserList /> */}
      <div className={sideBarStyles.body}>
        <h3 className={sideBarStyles.usersTitle}>Conectados ({users.length})</h3>
        <ul className={sideBarStyles.userList}>
          {users.map((user, index) => (
            <li key={`${user}-${index}`} className={sideBarStyles.userItem}>
              <div className={sideBarStyles.onlineDot} />
              {user} {user === username && '(tu)'}
            </li>
          ))}
        </ul>
      </div>

      {/* Posible componente: <SidebarFooter /> */}
      <div className={sideBarStyles.footer}>
        <button onClick={onLeave} className={sideBarStyles.leaveButton}>
          <LogOut className={sideBarStyles.leaveIcon} />
          Salir
        </button>
      </div>
    </div>
  );
}
