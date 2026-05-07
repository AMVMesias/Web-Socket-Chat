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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 via-transparent to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-zinc-950 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_0%,#000_100%)]"></div>
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
      
      <main className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center animate-in fade-in duration-1000 ease-out">
        <section className="space-y-12 animate-in slide-in-from-left-8 duration-700 ease-out">
          <div className="relative space-y-6">
            <div className="relative inline-flex items-center justify-center rounded-2xl bg-blue-500/10 p-4 ring-1 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Lock className="h-8 w-8 text-blue-400" strokeWidth={1.5} />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 blur-sm animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Protocolo de Red Activo
              </div>
              
              <h1 className="text-6xl font-black tracking-tighter text-white lg:text-7xl xl:text-8xl">
                Nexus <span className="relative inline-block">
                  <span className="relative z-10 text-blue-500">ESPE</span>
                  <span className="absolute -inset-1 z-0 bg-blue-500/20 blur-2xl animate-pulse"></span>
                </span>
              </h1>
              
              <p className="max-w-md text-lg font-medium leading-relaxed text-zinc-400">
                Puerta de enlace a la comunicación <span className="text-zinc-200 border-b border-blue-500/30">encriptada y efímera</span>. 
                Tu rastro digital termina aquí.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="group/form relative space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-zinc-700/50">
            {/* Glow effect on hover */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/0 opacity-0 blur transition-opacity group-hover/form:opacity-100"></div>
            
            <div className="relative space-y-2">
              <label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 transition-colors group-focus-within/form:text-blue-400">
                Identidad Digital
              </label>
              <div className="group/input relative">
                <input
                  id="username"
                  type="text"
                  required
                  className="block w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-blue-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Tu alias en la red"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 transition-opacity group-focus-within/input:opacity-100 pointer-events-none"></div>
              </div>
            </div>

            <div className="relative space-y-2">
              <label htmlFor="room" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 transition-colors group-focus-within/form:text-blue-400">
                Coordenadas de Sala
              </label>
              <div className="group/input relative">
                <input
                  id="room"
                  type="text"
                  required
                  className="block w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-blue-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Código de acceso"
                  value={selectedRoom}
                  onChange={(event) => setSelectedRoom(event.target.value)}
                />
                <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 transition-opacity group-focus-within/input:opacity-100 pointer-events-none"></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || !selectedRoom.trim() || selectedRoomInfo?.full}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-6 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]"></div>
              <Users className="h-4 w-4 relative z-10" strokeWidth={2.5} />
              <span className="relative z-10">Acceder al Nexo</span>
            </button>
          </form>

          {(error || feedback) && (
            <div
              className={`rounded-2xl border px-6 py-4 text-xs font-bold animate-in fade-in zoom-in-95 duration-500 fill-mode-both ${
                error
                  ? 'border-red-500/30 bg-red-500/5 text-red-400'
                  : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ring-4 ${error ? 'bg-red-500 ring-red-500/20' : 'bg-blue-500 ring-blue-500/20'}`} />
                {error || feedback}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-8 animate-in slide-in-from-right-8 duration-700 ease-out delay-150 fill-mode-both">
          <form onSubmit={handleCreateRoom} className="group/create relative rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8 backdrop-blur-md transition-all hover:border-zinc-700/50 hover:bg-zinc-900/40">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 ring-1 ring-zinc-700/50 transition-transform group-hover/create:scale-110 group-hover/create:rotate-3">
                <Plus className="h-5 w-5 text-blue-400" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">Generar Nodo</h2>
                <p className="text-[10px] font-medium text-zinc-500">Crea una instancia privada</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <label htmlFor="new-room" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  ID Único
                </label>
                <input
                  id="new-room"
                  type="text"
                  className="block w-full rounded-xl border border-zinc-700 bg-zinc-950/30 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-blue-400 focus:bg-zinc-950 outline-none transition-all"
                  placeholder="Ej. alfa-centauri"
                  value={newRoom}
                  onChange={(event) => setNewRoom(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="capacity" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Cupo
                </label>
                <input
                  id="capacity"
                  type="number"
                  min={2}
                  max={20}
                  className="block w-full rounded-xl border border-zinc-700 bg-zinc-950/30 px-4 py-3 text-center text-sm text-white focus:border-blue-400 focus:bg-zinc-950 outline-none transition-all"
                  value={capacity}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !socketReady || !newRoom.trim()}
              className="group/btn mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 transition-all hover:border-zinc-500 hover:bg-zinc-800 hover:text-white disabled:opacity-20"
            >
              {creating ? (
                <RefreshCw className="h-3 w-3 animate-spin" strokeWidth={3} />
              ) : (
                <Plus className="h-3 w-3 transition-transform group-hover/btn:rotate-90" strokeWidth={3} />
              )}
              {creating ? 'Iniciando Red...' : 'Establecer Enlace'}
            </button>
          </form>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 ring-1 ring-zinc-600/50">
                  <RefreshCw className="h-5 w-5 text-zinc-300" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white uppercase">Nodos Activos</h2>
                  <p className="text-[10px] font-medium text-zinc-500">Instancias disponibles</p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshRooms}
                disabled={!socketReady}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/50 hover:bg-zinc-700 hover:text-white transition-all hover:ring-zinc-500 disabled:opacity-20"
              >
                <RefreshCw className="h-4 w-4 transition-transform duration-700 group-hover:rotate-180" strokeWidth={2.5} />
              </button>
            </div>

            <div className="max-h-72 space-y-4 overflow-y-auto pr-3 custom-scrollbar">
              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-zinc-500">
                  <RefreshCw className="mb-4 h-8 w-8 opacity-20 animate-spin-slow" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Buscando Nodos...</p>
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
                    className={`group relative flex w-full flex-col gap-3 rounded-2xl border p-5 text-left transition-all animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both ${
                      selectedRoom === room.room
                        ? 'border-blue-400/60 bg-blue-500/10 ring-1 ring-blue-400/60 scale-[1.02]'
                        : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 hover:bg-zinc-800/50 hover:scale-[1.01]'
                    } ${room.full ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="block text-sm font-black text-zinc-200 group-hover:text-white transition-colors">
                          {room.room}
                        </span>
                        <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          ID: {room.created_by}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] font-bold text-zinc-400 group-hover:text-blue-300 transition-colors">
                          {room.current}/{room.capacity}
                        </span>
                        <div className={`h-2 w-2 rounded-full shadow-[0_0_10px] ${room.full ? 'bg-zinc-700 shadow-transparent' : 'bg-blue-400 shadow-blue-400/50 animate-pulse'}`} />
                      </div>
                    </div>
                    
                    {/* Visual Capacity Indicator */}
                    <div className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div 
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${room.full ? 'bg-zinc-600' : 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
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
