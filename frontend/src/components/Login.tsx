import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRoomLobby } from '../hooks/useRoomLobby';
import { loginStyles } from '../styles/classNames';
import CreateRoomForm from './login/CreateRoomForm';
import FeedbackBanner from './login/FeedbackBanner';
import JoinRoomForm from './login/JoinRoomForm';
import LoginBackground from './login/LoginBackground';
import LoginHero from './login/LoginHero';
import RoomListPanel from './login/RoomListPanel';

interface LoginProps {
  onJoin: (username: string, room: string) => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

export default function Login({ onJoin }: LoginProps) {
  const { creating, createRoom, refreshRooms, rooms, socketReady } = useRoomLobby();
  const [username, setUsername] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [capacity, setCapacity] = useState(2);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const selectedRoomInfo = useMemo(
    () => rooms.find((room) => room.room === selectedRoom.trim()),
    [rooms, selectedRoom],
  );

  const clearMessages = () => {
    setError('');
    setFeedback('');
  };

  const handleCreateRoom = async (event: FormEvent) => {
    event.preventDefault();
    clearMessages();

    const cleanUsername = username.trim();
    const cleanRoom = newRoom.trim();

    if (!cleanRoom) {
      setError('Escribe un codigo para la sala.');
      return;
    }

    try {
      const createdRoom = await createRoom(cleanUsername, cleanRoom, capacity);
      setSelectedRoom(createdRoom.room);
      setNewRoom('');
      setFeedback(`Sala ${createdRoom.room} creada y seleccionada.`);
    } catch (createError) {
      setError(getErrorMessage(createError, 'No se pudo crear la sala.'));
    }
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    clearMessages();

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

  const handleSelectRoom = (room: string) => {
    setSelectedRoom(room);
    clearMessages();
  };

  return (
    <div className={loginStyles.page}>
      <LoginBackground />

      <main className={loginStyles.main}>
        <section className={loginStyles.introSection}>
          <LoginHero />
          <JoinRoomForm
            isRoomFull={selectedRoomInfo?.full}
            onSubmit={handleJoin}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            setUsername={setUsername}
            username={username}
          />
          <FeedbackBanner error={error} feedback={feedback} />
        </section>

        <section className={loginStyles.actionsSection}>
          <CreateRoomForm
            capacity={capacity}
            creating={creating}
            newRoom={newRoom}
            onSubmit={handleCreateRoom}
            setCapacity={setCapacity}
            setNewRoom={setNewRoom}
            socketReady={socketReady}
          />
          <RoomListPanel
            onRefresh={refreshRooms}
            onSelectRoom={handleSelectRoom}
            rooms={rooms}
            selectedRoom={selectedRoom}
            socketReady={socketReady}
          />
        </section>
      </main>
    </div>
  );
}
