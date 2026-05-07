import type { SyntheticEvent } from 'react';
import { Users } from 'lucide-react';
import { loginStyles } from '../../styles/classNames';

interface JoinRoomFormProps {
  isRoomFull?: boolean;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  selectedRoom: string;
  setSelectedRoom: (value: string) => void;
  setUsername: (value: string) => void;
  username: string;
}

export default function JoinRoomForm({
  isRoomFull,
  onSubmit,
  selectedRoom,
  setSelectedRoom,
  setUsername,
  username,
}: JoinRoomFormProps) {
  return (
    <form onSubmit={onSubmit} className={loginStyles.joinForm}>
      <div className={loginStyles.joinFormGlow}></div>

      <div className={loginStyles.field}>
        <label htmlFor="username" className={loginStyles.joinLabel}>
          Identidad Digital
        </label>
        <div className={loginStyles.fieldGroup}>
          <input
            id="username"
            type="text"
            required
            className={loginStyles.joinInput}
            placeholder="Tu alias en la red"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <div className={loginStyles.inputOverlay}></div>
        </div>
      </div>

      <div className={loginStyles.field}>
        <label htmlFor="room" className={loginStyles.joinLabel}>
          Coordenadas de Sala
        </label>
        <div className={loginStyles.fieldGroup}>
          <input
            id="room"
            type="text"
            required
            className={loginStyles.joinInput}
            placeholder="Código de acceso"
            value={selectedRoom}
            onChange={(event) => setSelectedRoom(event.target.value)}
          />
          <div className={loginStyles.inputOverlay}></div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!username.trim() || !selectedRoom.trim() || isRoomFull}
        className={loginStyles.joinButton}
      >
        <div className={loginStyles.joinButtonShine}></div>
        <Users className={loginStyles.joinButtonIcon} strokeWidth={2.5} />
        <span className={loginStyles.joinButtonText}>Acceder al Nexo</span>
      </button>
    </form>
  );
}
