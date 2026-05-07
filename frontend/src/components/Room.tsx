import { useChatRoom } from '../hooks/useChatRoom';
import { roomStyles } from '../styles/classNames';
import Chat from './organisms/Chat';
import SideBar from './organisms/SideBar';
import ReaderMenuDialog from './room/ReaderMenuDialog';
import ErrorTemplate from './templates/ErrorTemplate';

interface RoomProps {
  username: string;
  room: string;
  onLeave: () => void;
}

export default function Room({ username, room, onLeave }: RoomProps) {
  const {
    handleMessageContextMenu,
    handleSend,
    inputValue,
    joinError,
    messages,
    messagesEndRef,
    readerMenu,
    selectedMessage,
    setInputValue,
    setMessageRef,
    setTtl,
    socketReady,
    ttl,
    users,
  } = useChatRoom({ room, username });

  if (joinError) {
    return (
      <ErrorTemplate title="No se pudo entrar" subtitle={joinError}>
        <button type="button" onClick={onLeave} className={roomStyles.joinErrorButton}>
          Volver al inicio
        </button>
      </ErrorTemplate>
    );
  }

  return (
    <div className={roomStyles.page}>
      <SideBar room={room} username={username} users={users} onLeave={onLeave} />
      <Chat
        inputValue={inputValue}
        messages={messages}
        messagesEndRef={messagesEndRef}
        setInputValue={setInputValue}
        setMessageRef={setMessageRef}
        setTtl={setTtl}
        socketReady={socketReady}
        ttl={ttl}
        username={username}
        usersCount={users.length}
        handleMessageContextMenu={handleMessageContextMenu}
        handleSend={handleSend}
      />

      {readerMenu && selectedMessage && (
        <ReaderMenuDialog
          fallbackRecipientCount={Math.max(users.length - 1, 0)}
          readerMenu={readerMenu}
          selectedMessage={selectedMessage}
        />
      )}
    </div>
  );
}
