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
  sender: {
    id: string;
    username?: string;
    name?: string;
    profile_pic?: string;
  };
  recipient: { id: string };
  timestamp: number;
  read?: {
    mid?: string;
  };
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
    attachments?: {
      type: string;
      payload?: {
        url?: string;
      };
    }[];
    reply_to?: {
      story?: {
        id?: string;
        url?: string;
        link_sticker_url?: string;
      };
    };
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
