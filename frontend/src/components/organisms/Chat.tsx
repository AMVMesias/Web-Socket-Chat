import type { MouseEvent as ReactMouseEvent, SyntheticEvent } from 'react';
import { Check, CheckCheck, Clock, Send } from 'lucide-react';
import type { MessageWithCountdown } from '../../types';
import { chatStyles } from '../../styles/classNames';
import { getReadSummary } from '../../utils/chat';

interface ChatPanelProps {
  inputValue: string;
  messages: MessageWithCountdown[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setInputValue: (value: string) => void;
  setMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  setTtl: (value: number) => void;
  socketReady: boolean;
  ttl: number;
  username: string;
  usersCount: number;
  handleMessageContextMenu: (
    event: ReactMouseEvent<HTMLElement>,
    message: MessageWithCountdown,
    isMe: boolean,
  ) => void;
  handleSend: (event: SyntheticEvent<HTMLFormElement>) => void;
}

export default function Chat({
  inputValue,
  messages,
  messagesEndRef,
  setInputValue,
  setMessageRef,
  setTtl,
  socketReady,
  ttl,
  username,
  usersCount,
  handleMessageContextMenu,
  handleSend,
}: ChatPanelProps) {
  const formatRemainingTime = (seconds?: number) => {
    if (seconds === undefined) return 'en espera';
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={chatStyles.panel}>
      {/* Posible componente: <MessageList /> */}
      <div className={chatStyles.messageList}>
        {messages.map((message) => {
          const isMe = message.username === username;
          const readSummary = getReadSummary(message, Math.max(usersCount - 1, 0));
          const readBy = message.readBy ?? [];

          // Posible componente: <ChatBubble />
          return (
            <div key={message.id} className={chatStyles.messageRow(isMe)}>
              <div
                ref={setMessageRef(message.id)}
                data-message-id={message.id}
                onContextMenu={(event) => handleMessageContextMenu(event, message, isMe)}
                title={isMe ? 'Clic derecho para ver lectores' : undefined}
                className={chatStyles.bubble(isMe)}
              >
                {!isMe && <div className={chatStyles.senderName}>{message.username}</div>}

                <div className={chatStyles.messageText}>{message.message}</div>

                <div className={chatStyles.metaRow(isMe)}>
                  {message.ttl !== undefined && (
                    <div
                      className={chatStyles.timer(Boolean(message.expiresAt))}
                      title={
                        message.expiresAt ? 'Autodestruccion activa' : 'Esperando que todos lean'
                      }
                    >
                      <Clock className={chatStyles.timerIcon} />
                      {message.expiresAt
                        ? formatRemainingTime(message.remainingTime)
                        : 'esperando todos'}
                    </div>
                  )}

                  <span>{message.timestamp}</span>

                  {isMe && (
                    <button
                      type="button"
                      onClick={(event) => handleMessageContextMenu(event, message, true)}
                      className={chatStyles.readButton}
                      title={readSummary}
                    >
                      {readBy.length > 0 ? (
                        <CheckCheck className={chatStyles.readIcon(Boolean(message.all_read))} />
                      ) : (
                        <Check className={chatStyles.unreadIcon} />
                      )}
                      <span>
                        {message.recipient_count
                          ? `${readBy.length}/${message.recipient_count}`
                          : ''}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Posible componente: <ChatInput /> */}
      <div className={chatStyles.footer}>
        <form onSubmit={handleSend} className={chatStyles.form}>
          <select
            value={ttl}
            onChange={(event) => setTtl(Number(event.target.value))}
            className={chatStyles.ttlSelect}
          >
            <option value={0}>Sin temporizador</option>
            <option value={10}>10 segundos</option>
            <option value={60}>1 minuto</option>
            <option value={300}>5 minutos</option>
          </select>

          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Escribe un mensaje..."
            className={chatStyles.messageInput}
          />

          <button
            type="submit"
            disabled={!socketReady || !inputValue.trim()}
            className={chatStyles.sendButton}
          >
            <Send className={chatStyles.sendIcon} />
          </button>
        </form>
      </div>
    </div>
  );
}
