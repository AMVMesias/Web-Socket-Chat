import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { socketUrl } from '../config/socket';
import type { CreateRoomResponse, RoomSummary, SocketTimeoutError } from '../types';

const createRoomTimeoutMessage =
  'El servidor no respondio al crear la sala. Verifica que estes usando el servidor actualizado.';

export const useRoomLobby = () => {
  const socketRef = useRef<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [creating, setCreating] = useState(false);

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

  const refreshRooms = useCallback(() => {
    socketRef.current?.emit('get_rooms');
  }, []);

  const createRoom = useCallback(
    (username: string, room: string, capacity: number) =>
      new Promise<RoomSummary>((resolve, reject) => {
        const currentSocket = socketRef.current;

        if (creating) {
          reject(new Error('Ya se esta creando una sala.'));
          return;
        }

        if (!currentSocket || !socketReady) {
          reject(
            new Error('No hay conexion con el servidor. Actualiza la pagina e intenta otra vez.'),
          );
          return;
        }

        setCreating(true);
        currentSocket
          .timeout(5000)
          .emit(
            'create_room',
            { username, room, capacity },
            (timeoutError: SocketTimeoutError, response?: CreateRoomResponse) => {
              setCreating(false);

              if (timeoutError) {
                reject(new Error(createRoomTimeoutMessage));
                return;
              }

              if (!response?.ok || !response.room) {
                reject(new Error(response?.error ?? 'No se pudo crear la sala.'));
                return;
              }

              setRooms((currentRooms) => {
                const otherRooms = currentRooms.filter(
                  (currentRoom) => currentRoom.room !== response.room!.room,
                );
                return [...otherRooms, response.room!].sort((a, b) => a.room.localeCompare(b.room));
              });
              resolve(response.room);
            },
          );
      }),
    [creating, socketReady],
  );

  return {
    creating,
    createRoom,
    refreshRooms,
    rooms,
    socketReady,
  };
};
