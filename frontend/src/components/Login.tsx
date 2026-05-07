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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <main className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center rounded-xl bg-blue-500/10 p-3 ring-1 ring-blue-500/30">
              <Lock className="h-8 w-8 text-blue-400" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-white lg:text-6xl">
                Nexus <span className="text-blue-400">ESPE</span>
              </h1>
              <p className="mt-4 text-lg text-zinc-300 max-w-md leading-relaxed">
                Plataforma de comunicación segura y efímera. 
                Conecta de forma privada en salas temporales.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-sm">
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Identidad
              </label>
              <input
                id="username"
                type="text"
                required
                className="block w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-sm text-white placeholder-zinc-500 transition-all focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Escribe tu seudónimo"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="room" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Sala de Acceso
              </label>
              <input
                id="room"
                type="text"
                required
                className="block w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-sm text-white placeholder-zinc-500 transition-all focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="Selecciona o escribe el código"
                value={selectedRoom}
                onChange={(event) => setSelectedRoom(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim() || !selectedRoom.trim() || selectedRoomInfo?.full}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-500 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none"
            >
              <Users className="h-4 w-4 transition-transform group-hover:scale-110" strokeWidth={2} />
              Acceder a Nexus
            </button>
          </form>

          {(error || feedback) && (
            <div
              className={`rounded-xl border px-6 py-4 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300 ${
                error
                  ? 'border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${error ? 'bg-red-400' : 'bg-emerald-400'}`} />
                {error || feedback}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-6">
          <form onSubmit={handleCreateRoom} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-zinc-800/80 p-2 ring-1 ring-zinc-600/50">
                <Plus className="h-4 w-4 text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Nueva Sala</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <label htmlFor="new-room" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Código Único
                </label>
                <input
                  id="new-room"
                  type="text"
                  className="block w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="ej. mi-nexus-1"
                  value={newRoom}
                  onChange={(event) => setNewRoom(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="capacity" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Cupo
                </label>
                <input
                  id="capacity"
                  type="number"
                  min={2}
                  max={20}
                  className="block w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  value={capacity}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !socketReady || !newRoom.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white disabled:opacity-20"
            >
              {creating ? 'Procesando...' : 'Inicializar Sala'}
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-zinc-800/80 p-2 ring-1 ring-zinc-600/50">
                  <RefreshCw className="h-4 w-4 text-zinc-300" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Nodos Activos</h2>
              </div>

              <button
                type="button"
                onClick={refreshRooms}
                disabled={!socketReady}
                className="group rounded-full bg-zinc-800/80 p-2 text-zinc-400 ring-1 ring-zinc-700/50 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-20"
              >
                <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-12 text-zinc-500">
                  <p className="text-xs uppercase tracking-widest font-bold">Sin nodos activos</p>
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
                    className={`group relative flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                      selectedRoom === room.room
                        ? 'border-blue-400/60 bg-blue-500/10 ring-1 ring-blue-400/60'
                        : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 hover:bg-zinc-800/50'
                    } ${room.full ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <div className="space-y-1">
                      <span className="block text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
                        {room.room}
                      </span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        Host: {room.created_by}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 group-hover:text-blue-300 transition-colors">
                          {room.current}/{room.capacity}
                        </span>
                      </div>
                      <div className={`h-1.5 w-1.5 rounded-full shadow-[0_0_8px] ${room.full ? 'bg-zinc-600 shadow-transparent' : 'bg-blue-400 shadow-blue-400/50 animate-pulse'}`} />
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
