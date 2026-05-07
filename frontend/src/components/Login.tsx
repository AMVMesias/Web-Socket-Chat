import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Lock, Plus, RefreshCw, Users } from 'lucide-react';
import { loginStyles } from '../styles/classNames';

interface LoginProps {
  onJoin: (username: string, room: string) => void;
}

interface RoomSummary {
  room: string;
  capacity: number;
  current: number;
  available: number;
  full: boolean;
  created_by: string;
}

interface CreateRoomResponse {
  ok: boolean;
  error?: string;
  room?: RoomSummary;
}

type SocketTimeoutError = Error | null;

const socketUrl = import.meta.env.DEV ? 'http://127.0.0.1:5000' : window.location.origin;

export default function Login({ onJoin }: LoginProps) {
  const socketRef = useRef<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const selectedRoomInfo = useMemo(
    () => rooms.find((room) => room.room === selectedRoom.trim()),
    [rooms, selectedRoom],
  );

  useEffect(() => {
    const newSocket = io(socketUrl);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setSocketReady(true);
      newSocket.emit('get_rooms');
    });

    newSocket.on('disconnect', () => {
      setSocketReady(false);
    });

    newSocket.on('room_list', (roomList: RoomSummary[]) => {
      setRooms(roomList);
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const refreshRooms = () => {
    socketRef.current?.emit('get_rooms');
  };

  const handleCreateRoom = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFeedback('');

    const currentSocket = socketRef.current;
    if (creating) return;

    if (!currentSocket || !socketReady) {
      setError('No hay conexion con el servidor. Actualiza la pagina e intenta otra vez.');
      return;
    }

    const cleanUsername = username.trim();
    const cleanRoom = newRoom.trim();

    if (!cleanRoom) {
      setError('Escribe un codigo para la sala.');
      return;
    }

    setCreating(true);
    currentSocket
      .timeout(5000)
      .emit(
        'create_room',
        { username: cleanUsername, room: cleanRoom, capacity },
        (timeoutError: SocketTimeoutError, response?: CreateRoomResponse) => {
          setCreating(false);

          if (timeoutError) {
            setError(
              'El servidor no respondio al crear la sala. Verifica que estes usando el servidor actualizado.',
            );
            return;
          }

          if (!response?.ok || !response.room) {
            setError(response?.error ?? 'No se pudo crear la sala.');
            return;
          }

          setRooms((currentRooms) => {
            const otherRooms = currentRooms.filter((room) => room.room !== response.room!.room);
            return [...otherRooms, response.room!].sort((a, b) => a.room.localeCompare(b.room));
          });
          setSelectedRoom(response.room.room);
          setNewRoom('');
          setFeedback(`Sala ${response.room.room} creada y seleccionada.`);
        },
      );
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFeedback('');

    const cleanUsername = username.trim();
    const cleanRoom = selectedRoom.trim();

    if (!cleanUsername || !cleanRoom) {
      setError('Escribe tu nombre y elige una sala.');
      return;
    }

    if (!selectedRoomInfo) {
      setError('Esa sala no esta disponible. Creala o elige una de la lista.');
      return;
    }

    if (selectedRoomInfo.full) {
      setError('La sala seleccionada ya esta llena.');
      return;
    }

    onJoin(cleanUsername, cleanRoom);
  };

  return (
    <div className={loginStyles.page}>
      {/* Background Atmosphere */}
      <div className={loginStyles.background.wrapper}>
        <div className={loginStyles.background.grid}></div>
        <div className={loginStyles.background.radial}></div>
        <div className={loginStyles.background.mask}></div>
        {/* Noise overlay */}
        <div className={loginStyles.background.noise}></div>
      </div>

      <main className={loginStyles.main}>
        <section className={loginStyles.introSection}>
          <div className={loginStyles.introHeader}>
            <div className={loginStyles.brandIconBox}>
              <Lock className={loginStyles.brandIcon} strokeWidth={1.5} />
              <div className={loginStyles.brandPulse}></div>
            </div>

            <div className={loginStyles.brandContent}>
              <div className={loginStyles.statusBadge}>
                <span className={loginStyles.statusPingBox}>
                  <span className={loginStyles.statusPing}></span>
                  <span className={loginStyles.statusDot}></span>
                </span>
                Protocolo de Red Activo
              </div>

              <h1 className={loginStyles.title}>
                Nexus{' '}
                <span className={loginStyles.titleAccentBox}>
                  <span className={loginStyles.titleAccentText}>ESPE</span>
                  <span className={loginStyles.titleAccentGlow}></span>
                </span>
              </h1>

              <p className={loginStyles.subtitle}>
                Puerta de enlace a la comunicación{' '}
                <span className={loginStyles.subtitleHighlight}>encriptada y efímera</span>. Tu
                rastro digital termina aquí.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className={loginStyles.joinForm}>
            {/* Glow effect on hover */}
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
              disabled={!username.trim() || !selectedRoom.trim() || selectedRoomInfo?.full}
              className={loginStyles.joinButton}
            >
              {/* Shine effect */}
              <div className={loginStyles.joinButtonShine}></div>
              <Users className={loginStyles.joinButtonIcon} strokeWidth={2.5} />
              <span className={loginStyles.joinButtonText}>Acceder al Nexo</span>
            </button>
          </form>

          {(error || feedback) && (
            <div className={loginStyles.feedback(Boolean(error))}>
              <div className={loginStyles.feedbackBody}>
                <div className={loginStyles.feedbackDot(Boolean(error))} />
                {error || feedback}
              </div>
            </div>
          )}
        </section>

        <section className={loginStyles.actionsSection}>
          <form onSubmit={handleCreateRoom} className={loginStyles.createForm}>
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
                onClick={refreshRooms}
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
                    onClick={() => {
                      setSelectedRoom(room.room);
                      setError('');
                      setFeedback('');
                    }}
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

                    {/* Visual Capacity Indicator */}
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
        </section>
      </main>
    </div>
  );
}
