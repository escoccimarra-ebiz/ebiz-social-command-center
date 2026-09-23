export interface MetaWebhookEnvelope {
  object: "instagram" | "page";
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string;
  time: number;
  messaging?: MetaMessagingEvent[];
  changes?: MetaChangeEvent[];
}

export interface MetaMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
  };
}

export interface MetaChangeEvent {
  field: string;
  value: {
    id?: string;
    text?: string;
    from?: { id: string; username?: string };
    media?: { id: string };
    parent_id?: string;
    comment_id?: string;
    created_time?: number;
  };
}

