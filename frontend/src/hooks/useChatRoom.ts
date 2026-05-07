import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { socketUrl } from '../config/socket';
import type {
  ExpireStarted,
  Message,
  MessageWithCountdown,
  ReadReceipt,
  ReaderMenu,
} from '../types';

interface UseChatRoomOptions {
  room: string;
  username: string;
}

const readerMenuWidth = 272;
const readerMenuHeight = 220;

export const useChatRoom = ({ room, username }: UseChatRoomOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const readSentRef = useRef<Set<string>>(new Set());

  const [socketReady, setSocketReady] = useState(false);
  const [messages, setMessages] = useState<MessageWithCountdown[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [ttl, setTtl] = useState<number>(0);
  const [readerMenu, setReaderMenu] = useState<ReaderMenu | null>(null);
  const [joinError, setJoinError] = useState('');
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);

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
      prev.map((currentMessage) => {
        if (currentMessage.id !== message.id) return currentMessage;
        return {
          ...currentMessage,
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
            const message = messages.find((currentMessage) => currentMessage.id === messageId);
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

  const handleSend = useCallback(
    (event: FormEvent) => {
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
    },
    [inputValue, ttl],
  );

  const handleMessageContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLElement>, message: MessageWithCountdown, isMe: boolean) => {
      if (!isMe) return;

      event.preventDefault();
      setReaderMenu({
        messageId: message.id,
        x: Math.max(8, Math.min(event.clientX, window.innerWidth - readerMenuWidth - 8)),
        y: Math.max(8, Math.min(event.clientY, window.innerHeight - readerMenuHeight - 8)),
      });
    },
    [],
  );

  const selectedMessage = readerMenu
    ? messages.find((message) => message.id === readerMenu.messageId)
    : undefined;

  return {
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
  };
};
