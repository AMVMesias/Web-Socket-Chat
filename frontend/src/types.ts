export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  ttl?: number; // Total seconds to live
  readBy?: string[];
  read_count?: number;
  recipient_count?: number;
  all_read?: boolean;
}

export interface MessageWithCountdown extends Message {
  remainingTime?: number;
  expiresAt?: number;
  readLocally?: boolean;
}

export interface RoomSummary {
  room: string;
  capacity: number;
  current: number;
  available: number;
  full: boolean;
  created_by: string;
}

export interface CreateRoomResponse {
  ok: boolean;
  error?: string;
  room?: RoomSummary;
}

export type SocketTimeoutError = Error | null;

export interface ReadReceipt {
  message_id: string;
  reader?: string;
  readBy?: string[];
  read_count?: number;
  recipient_count?: number;
  all_read?: boolean;
}

export interface ExpireStarted {
  message_id: string;
  ttl?: number;
  expires_in?: number;
  all_read?: boolean;
}

export interface ReaderMenu {
  messageId: string;
  x: number;
  y: number;
}
