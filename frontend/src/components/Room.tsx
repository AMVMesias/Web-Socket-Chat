import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Eye } from 'lucide-react';
import type { Message } from '../types';
import { roomStyles } from '../styles/classNames';
import ErrorTemplate from './templates/ErrorTemplate';
import SideBar from './organisms/SideBar';
import Chat from './organisms/Chat';

interface ChatProps {
  username: string;
  room: string;
  onLeave: () => void;
}

interface MessageWithCountdown extends Message {
  remainingTime?: number;
  expiresAt?: number;
  readLocally?: boolean;
}

interface ReadReceipt {
  message_id: string;
  reader?: string;
  readBy?: string[];
  read_count?: number;
  recipient_count?: number;
  all_read?: boolean;
}

interface ExpireStarted {
  message_id: string;
  ttl?: number;
  expires_in?: number;
  all_read?: boolean;
}

interface ReaderMenu {
  messageId: string;
  x: number;
  y: number;
}

const getReadSummary = (message: MessageWithCountdown, fallbackRecipientCount: number) => {
  const readCount = message.read_count ?? message.readBy?.length ?? 0;
  const recipientCount = message.recipient_count ?? fallbackRecipientCount;

  if (recipientCount === 0) return 'Sin receptores';
  if (message.all_read) return `Todos leyeron (${readCount}/${recipientCount})`;
  return `Leido por ${readCount}/${recipientCount}`;
};

const socketUrl = import.meta.env.DEV ? 'http://127.0.0.1:5000' : window.location.origin;

export default function Room({ username, room, onLeave }: ChatProps) {
  const socketRef = useRef<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const [messages, setMessages] = useState<MessageWithCountdown[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [ttl, setTtl] = useState<number>(0);
  const [readerMenu, setReaderMenu] = useState<ReaderMenu | null>(null);
  const [joinError, setJoinError] = useState('');
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const readSentRef = useRef<Set<string>>(new Set());

  const startLocalCountdown = useCallback((message: MessageWithCountdown, seconds?: number) => {
    const ttlSeconds = seconds ?? message.ttl;
    if (!ttlSeconds || message.expiresAt) return {};

    return {
      ttl: message.ttl ?? ttlSeconds,
      expiresAt: Date.now() + ttlSeconds * 1000,
      remainingTime: ttlSeconds,
    };
  }, []);

  const markMessageAsRead = useCallback((message: MessageWithCountdown) => {
    const currentSocket = socketRef.current;
    if (!currentSocket || readSentRef.current.has(message.id)) return;

    readSentRef.current.add(message.id);
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== message.id) return m;
        return {
          ...m,
          readLocally: true,
        };
      }),
    );

    currentSocket.emit('message_read', { message_id: message.id });
  }, []);

  const setMessageRef = useCallback(
    (messageId: string) => (node: HTMLDivElement | null) => {
      if (node) {
        messageRefs.current.set(messageId, node);
      } else {
        messageRefs.current.delete(messageId);
      }
    },
    [],
  );

  useEffect(() => {
    const newSocket = io(socketUrl);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setSocketReady(true);
      newSocket.emit('join', { username, room });
    });

    newSocket.on('disconnect', () => {
      setSocketReady(false);
    });

    newSocket.on('join_error', (data: { message?: string }) => {
      setJoinError(data.message ?? 'No se pudo entrar a la sala.');
    });

    newSocket.on('user_list', (userList: string[]) => {
      setUsers(userList);
    });

    newSocket.on('chat_message', (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((message) => message.id === msg.id)) return prev;

        const newMessage: MessageWithCountdown = {
          ...msg,
          ttl: msg.ttl ?? undefined,
          readBy: msg.readBy ?? [],
          read_count: msg.read_count ?? 0,
          recipient_count: msg.recipient_count ?? 0,
          all_read: msg.all_read ?? false,
          readLocally: msg.username === username,
        };

        return [...prev, newMessage];
      });
    });

    newSocket.on('message_read', (data: ReadReceipt) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== data.message_id) return message;

          const existingReadBy = message.readBy ?? [];
          const readBy =
            data.readBy ??
            (data.reader && !existingReadBy.includes(data.reader)
              ? [...existingReadBy, data.reader]
              : existingReadBy);
          const recipientCount = data.recipient_count ?? message.recipient_count ?? 0;
          const readCount = data.read_count ?? readBy.length;
          const allRead = data.all_read ?? (recipientCount > 0 && readCount >= recipientCount);

          return {
            ...message,
            readBy,
            read_count: readCount,
            recipient_count: recipientCount,
            all_read: allRead,
          };
        }),
      );
    });

    newSocket.on('message_expire_started', (data: ExpireStarted) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== data.message_id) return message;

          return {
            ...message,
            all_read: data.all_read ?? message.all_read,
            ...startLocalCountdown(message, data.expires_in ?? data.ttl),
          };
        }),
      );
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [room, startLocalCountdown, username]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!socketReady || !pageVisible) return;

    const unreadIncomingMessages = messages.filter(
      (message) => message.username !== username && !message.readLocally,
    );

    if (unreadIncomingMessages.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      unreadIncomingMessages.forEach((message) => markMessageAsRead(message));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const messageId = entry.target.getAttribute('data-message-id');
          if (messageId) {
            const message = messages.find((m) => m.id === messageId);
            if (message) markMessageAsRead(message);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );

    unreadIncomingMessages.forEach((message) => {
      const node = messageRefs.current.get(message.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [markMessageAsRead, messages, pageVisible, socketReady, username]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();

      setMessages((prev) => {
        let changed = false;
        const nextMessages: MessageWithCountdown[] = [];

        prev.forEach((message) => {
          if (!message.expiresAt) {
            nextMessages.push(message);
            return;
          }

          const remainingTime = Math.ceil((message.expiresAt - now) / 1000);
          if (remainingTime <= 0) {
            changed = true;
            return;
          }

          if (remainingTime !== message.remainingTime) {
            changed = true;
            nextMessages.push({ ...message, remainingTime });
            return;
          }

          nextMessages.push(message);
        });

        return changed ? nextMessages : prev;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!readerMenu) return;

    const closeMenu = () => setReaderMenu(null);
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    window.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('keydown', closeWithEscape);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, [readerMenu]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    const currentSocket = socketRef.current;
    if (!inputValue.trim() || !currentSocket) return;

    const messageData = {
      id: crypto.randomUUID(),
      message: inputValue,
      timestamp: new Date().toLocaleTimeString(),
      ttl: ttl > 0 ? ttl : undefined,
    };

    currentSocket.emit('chat_message', messageData);
    setInputValue('');
  };

  const handleMessageContextMenu = (
    event: ReactMouseEvent<HTMLElement>,
    message: MessageWithCountdown,
    isMe: boolean,
  ) => {
    if (!isMe) return;

    event.preventDefault();
    const menuWidth = 272;
    const menuHeight = 220;
    setReaderMenu({
      messageId: message.id,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  };

  const selectedMessage = readerMenu
    ? messages.find((message) => message.id === readerMenu.messageId)
    : undefined;

  // Error al unirse a sala
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
      {/* Barra lateral */}
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

      {/* Posible componente: <ReadByDialog /> */}
      {readerMenu && selectedMessage && (
        <div
          role="dialog"
          aria-label="Lectores del mensaje"
          onClick={(event) => event.stopPropagation()}
          className={roomStyles.readerMenu}
          style={{ left: readerMenu.x, top: readerMenu.y }}
        >
          <div className={roomStyles.readerMenuHeader}>
            <Eye className={roomStyles.readerMenuIcon} />
            Visto del mensaje
          </div>
          <p className={roomStyles.readerMenuSummary}>
            {getReadSummary(selectedMessage, Math.max(users.length - 1, 0))}
          </p>

          {(selectedMessage.readBy ?? []).length > 0 ? (
            <ul className={roomStyles.readerList}>
              {(selectedMessage.readBy ?? []).map((reader) => (
                <li key={reader} className={roomStyles.readerListItem}>
                  {reader}
                </li>
              ))}
            </ul>
          ) : (
            <p className={roomStyles.emptyReaders}>Nadie lo ha leido todavia.</p>
          )}
        </div>
      )}
    </div>
  );
}
