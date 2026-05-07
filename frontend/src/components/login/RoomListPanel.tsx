import { RefreshCw } from 'lucide-react';
import { loginStyles } from '../../styles/classNames';
import type { RoomSummary } from '../../types';

interface RoomListPanelProps {
  onRefresh: () => void;
  onSelectRoom: (room: string) => void;
  rooms: RoomSummary[];
  selectedRoom: string;
  socketReady: boolean;
}

export default function RoomListPanel({
  onRefresh,
  onSelectRoom,
  rooms,
  selectedRoom,
  socketReady,
}: RoomListPanelProps) {
  return (
    <div className={loginStyles.roomsPanel}>
      <div className={loginStyles.roomsHeader}>
        <div className={loginStyles.roomsHeaderTitleGroup}>
          <div className={loginStyles.roomsIconBox}>
            <RefreshCw className={loginStyles.roomsIcon} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={loginStyles.roomsTitle}>Nodos Activos</h2>
            <p className={loginStyles.roomsSubtitle}>Instancias disponibles</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={!socketReady}
          className={loginStyles.refreshButton}
        >
          <RefreshCw className={loginStyles.refreshIcon} strokeWidth={2.5} />
        </button>
      </div>

      <div className={loginStyles.roomList}>
        {rooms.length === 0 ? (
          <div className={loginStyles.emptyRooms}>
            <RefreshCw className={loginStyles.emptyRoomsIcon} />
            <p className={loginStyles.emptyRoomsText}>Buscando Nodos...</p>
          </div>
        ) : (
          rooms.map((room, idx) => (
            <button
              key={room.room}
              type="button"
              disabled={room.full}
              onClick={() => onSelectRoom(room.room)}
              style={{ animationDelay: `${idx * 75}ms` }}
              className={loginStyles.roomButton(selectedRoom === room.room, room.full)}
            >
              <div className={loginStyles.roomHeader}>
                <div className={loginStyles.roomTextGroup}>
                  <span className={loginStyles.roomName}>{room.room}</span>
                  <span className={loginStyles.roomId}>ID: {room.created_by}</span>
                </div>
                <div className={loginStyles.roomStats}>
                  <span className={loginStyles.roomCapacity}>
                    {room.current}/{room.capacity}
                  </span>
                  <div className={loginStyles.roomStatusDot(room.full)} />
                </div>
              </div>

              <div className={loginStyles.capacityTrack}>
                <div
                  className={loginStyles.capacityFill(room.full)}
                  style={{ width: `${(room.current / room.capacity) * 100}%` }}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
