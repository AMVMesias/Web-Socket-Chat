import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { Check, CheckCheck, Clock, Send } from 'lucide-react';
import type { Message } from '../../types';

interface MessageWithCountdown extends Message {
  remainingTime?: number;
  expiresAt?: number;
  readLocally?: boolean;
}

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
  handleSend: (event: FormEvent) => void;
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

  const getReadSummary = (message: MessageWithCountdown, fallbackRecipientCount: number) => {
    const readCount = message.read_count ?? message.readBy?.length ?? 0;
    const recipientCount = message.recipient_count ?? fallbackRecipientCount;

    if (recipientCount === 0) return 'Sin receptores';
    if (message.all_read) return `Todos leyeron (${readCount}/${recipientCount})`;
    return `Leido por ${readCount}/${recipientCount}`;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Posible componente: <MessageList /> */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => {
          const isMe = message.username === username;
          const readSummary = getReadSummary(message, Math.max(usersCount - 1, 0));
          const readBy = message.readBy ?? [];

          // Posible componente: <ChatBubble />
          return (
            <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                ref={setMessageRef(message.id)}
                data-message-id={message.id}
                onContextMenu={(event) => handleMessageContextMenu(event, message, isMe)}
                title={isMe ? 'Clic derecho para ver lectores' : undefined}
                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  isMe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
                }`}
              >
                {!isMe && (
                  <div className="text-xs text-gray-300 font-bold mb-1">{message.username}</div>
                )}

                <div className="break-words">{message.message}</div>

                <div
                  className={`flex flex-wrap items-center justify-end gap-2 mt-1 text-xs ${
                    isMe ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {message.ttl !== undefined && (
                    <div
                      className={`flex items-center gap-1 ${
                        message.expiresAt ? 'text-orange-200' : 'text-gray-300'
                      }`}
                      title={
                        message.expiresAt ? 'Autodestruccion activa' : 'Esperando que todos lean'
                      }
                    >
                      <Clock className="w-3 h-3" />
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
                      className="ml-1 flex items-center gap-1 rounded px-1 py-0.5 hover:bg-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      title={readSummary}
                    >
                      {readBy.length > 0 ? (
                        <CheckCheck
                          className={`w-4 h-4 ${
                            message.all_read ? 'text-emerald-200' : 'text-blue-200'
                          }`}
                        />
                      ) : (
                        <Check className="w-4 h-4" />
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
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSend} className="flex gap-2">
          <select
            value={ttl}
            onChange={(event) => setTtl(Number(event.target.value))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={!socketReady || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
