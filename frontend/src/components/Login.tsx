import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Lock, Plus, RefreshCw, Users } from 'lucide-react';

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

    if (!cleanUsername) {
      setError('Escribe tu nombre antes de crear una sala.');
      return;
    }

    if (!cleanRoom) {
      setError('Escribe un codigo para la sala.');
      return;
    }

    setCreating(true);
    currentSocket.timeout(5000).emit(
      'create_room',
      { username: cleanUsername, room: cleanRoom, capacity },
      (timeoutError: SocketTimeoutError, response?: CreateRoomResponse) => {
        setCreating(false);

        if (timeoutError) {
          setError('El servidor no respondio al crear la sala. Verifica que estes usando el servidor actualizado.');
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
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-3">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Chat privado ESPE</h1>
              <p className="mt-1 text-gray-400">Salas temporales para mensajeria privada.</p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-xl">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu seudonimo"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-300">
                Sala seleccionada
              </label>
              <input
                id="room"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Elige una sala disponible"
                value={selectedRoom}
                onChange={(event) => setSelectedRoom(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim() || !selectedRoom.trim() || selectedRoomInfo?.full}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Users className="h-4 w-4" />
              Entrar a la sala
            </button>
          </form>

          {(error || feedback) && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                error
                  ? 'border-red-500/50 bg-red-500/10 text-red-200'
                  : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
              }`}
            >
              {error || feedback}
            </div>
          )}
        </section>

        <section className="grid gap-4">
          <form onSubmit={handleCreateRoom} className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-300" />
              <h2 className="text-xl font-semibold">Crear sala</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
              <div>
                <label htmlFor="new-room" className="block text-sm font-medium text-gray-300">
                  Codigo
                </label>
                <input
                  id="new-room"
                  type="text"
                  className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sala-privada"
                  value={newRoom}
                  onChange={(event) => setNewRoom(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-300">
                  Participantes
                </label>
                <input
                  id="capacity"
                  type="number"
                  min={2}
                  max={20}
                  className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={capacity}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !socketReady || !username.trim() || !newRoom.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Creando...' : 'Crear sala'}
            </button>
          </form>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-300" />
                <h2 className="text-xl font-semibold">Salas disponibles</h2>
              </div>

              <button
                type="button"
                onClick={refreshRooms}
                disabled={!socketReady}
                className="rounded-lg border border-gray-600 p-2 text-gray-200 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Actualizar salas"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {rooms.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-600 px-4 py-8 text-center text-sm text-gray-400">
                  No hay salas disponibles.
                </div>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.room}
                    type="button"
                    disabled={room.full}
                    onClick={() => {
                      setSelectedRoom(room.room);
                      setError('');
                      setFeedback('');
                    }}
                    className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${
                      selectedRoom === room.room
                        ? 'border-blue-400 bg-blue-500/20'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-700/70'
                    } ${room.full ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <span>
                      <span className="block font-semibold">{room.room}</span>
                      <span className="text-xs text-gray-400">Creada por {room.created_by}</span>
                    </span>
                    <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-200">
                      {room.current}/{room.capacity}
                    </span>
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
