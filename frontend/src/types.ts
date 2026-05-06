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
