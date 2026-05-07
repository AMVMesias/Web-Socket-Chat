import type { MessageWithCountdown } from '../types';

export const getReadSummary = (message: MessageWithCountdown, fallbackRecipientCount: number) => {
  const readCount = message.read_count ?? message.readBy?.length ?? 0;
  const recipientCount = message.recipient_count ?? fallbackRecipientCount;

  if (recipientCount === 0) return 'Sin receptores';
  if (message.all_read) return `Todos leyeron (${readCount}/${recipientCount})`;
  return `Leido por ${readCount}/${recipientCount}`;
};
