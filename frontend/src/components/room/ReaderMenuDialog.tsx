import { Eye } from 'lucide-react';
import { roomStyles } from '../../styles/classNames';
import type { MessageWithCountdown, ReaderMenu } from '../../types';
import { getReadSummary } from '../../utils/chat';

interface ReaderMenuDialogProps {
  fallbackRecipientCount: number;
  readerMenu: ReaderMenu;
  selectedMessage: MessageWithCountdown;
}

export default function ReaderMenuDialog({
  fallbackRecipientCount,
  readerMenu,
  selectedMessage,
}: ReaderMenuDialogProps) {
  const readers = selectedMessage.readBy ?? [];

  return (
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
        {getReadSummary(selectedMessage, fallbackRecipientCount)}
      </p>

      {readers.length > 0 ? (
        <ul className={roomStyles.readerList}>
          {readers.map((reader) => (
            <li key={reader} className={roomStyles.readerListItem}>
              {reader}
            </li>
          ))}
        </ul>
      ) : (
        <p className={roomStyles.emptyReaders}>Nadie lo ha leido todavia.</p>
      )}
    </div>
  );
}
