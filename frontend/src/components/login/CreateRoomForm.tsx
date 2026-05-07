import type { SyntheticEvent } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { loginStyles } from '../../styles/classNames';

interface CreateRoomFormProps {
  capacity: number;
  creating: boolean;
  newRoom: string;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  setCapacity: (value: number) => void;
  setNewRoom: (value: string) => void;
  socketReady: boolean;
}

export default function CreateRoomForm({
  capacity,
  creating,
  newRoom,
  onSubmit,
  setCapacity,
  setNewRoom,
  socketReady,
}: CreateRoomFormProps) {
  return (
    <form onSubmit={onSubmit} className={loginStyles.createForm}>
      <div className={loginStyles.panelHeader}>
        <div className={loginStyles.createIconBox}>
          <Plus className={loginStyles.createIcon} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className={loginStyles.panelTitle}>Generar Nodo</h2>
          <p className={loginStyles.panelSubtitle}>Crea una instancia privada</p>
        </div>
      </div>

      <div className={loginStyles.createGrid}>
        <div className={loginStyles.field}>
          <label htmlFor="new-room" className={loginStyles.compactLabel}>
            ID Único
          </label>
          <input
            id="new-room"
            type="text"
            className={loginStyles.createInput}
            placeholder="Ej. alfa-centauri"
            value={newRoom}
            onChange={(event) => setNewRoom(event.target.value)}
          />
        </div>

        <div className={loginStyles.field}>
          <label htmlFor="capacity" className={loginStyles.compactLabel}>
            Cupo
          </label>
          <input
            id="capacity"
            type="number"
            min={2}
            max={20}
            className={loginStyles.capacityInput}
            value={capacity}
            onChange={(event) => setCapacity(Number(event.target.value))}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={creating || !socketReady || !newRoom.trim()}
        className={loginStyles.createButton}
      >
        {creating ? (
          <RefreshCw className={loginStyles.createButtonSpinner} strokeWidth={3} />
        ) : (
          <Plus className={loginStyles.createButtonIcon} strokeWidth={3} />
        )}
        {creating ? 'Iniciando Red...' : 'Establecer Enlace'}
      </button>
    </form>
  );
}
