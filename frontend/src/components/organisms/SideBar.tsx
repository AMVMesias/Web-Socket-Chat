import { LogOut, Users, X } from 'lucide-react';
import { sideBarStyles } from '../../styles/classNames';

interface SideBarProps {
  room: string;
  username: string;
  users: string[];
  onLeave: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SideBar({
  room,
  username,
  users,
  onLeave,
  isOpen,
  onClose,
}: SideBarProps) {
  return (
    <div className={sideBarStyles.panel(isOpen)}>
      <div className={sideBarStyles.header}>
        <div className={sideBarStyles.headerTop}>
          <h2 className={sideBarStyles.title}>
            <Users className={sideBarStyles.titleIcon} />
            Sala: {room}
          </h2>
          <button onClick={onClose} className={sideBarStyles.closeButton} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className={sideBarStyles.username}>Usuario: {username}</p>
      </div>

      <div className={sideBarStyles.body}>
        <h3 className={sideBarStyles.usersTitle}>Conectados ({users.length})</h3>
        <ul className={sideBarStyles.userList}>
          {users.map((user, index) => (
            <li key={`${user}-${index}`} className={sideBarStyles.userItem}>
              <div className={sideBarStyles.onlineDot} />
              {user} {user === username && <span className="text-zinc-500 text-xs ml-1">(tú)</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className={sideBarStyles.footer}>
        <button onClick={onLeave} className={sideBarStyles.leaveButton}>
          <LogOut className={sideBarStyles.leaveIcon} />
          Salir de la sala
        </button>
      </div>
    </div>
  );
}
