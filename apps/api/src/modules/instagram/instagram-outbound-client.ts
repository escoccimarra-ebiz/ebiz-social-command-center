export interface InstagramOutboundClient {
  sendText(params: {
    igBusinessAccountId: string;
    recipientId: string;
    text: string;
    attachments?: InstagramOutboundAttachment[];
  }): Promise<InstagramSendResult>;
}

export interface InstagramOutboundAttachment {
  type: "image" | "video" | "audio" | "file" | "unknown";
  name: string;
  mimeType: string;
  dataUrl: string;
  sizeBytes: number;
}

export interface InstagramSendResult {
  ok: boolean;
  providerMessageId?: string;
  raw?: unknown;
}

export class HttpInstagramOutboundClient implements InstagramOutboundClient {
  constructor(
    private readonly endpoint: string,
    private readonly sharedSecret?: string
  ) {}

  async sendText(params: {
    igBusinessAccountId: string;
    recipientId: string;
    text: string;
    attachments?: InstagramOutboundAttachment[];
  }): Promise<InstagramSendResult> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(this.sharedSecret === undefined ? {} : { "x-scc-internal-secret": this.sharedSecret })
      },
      body: JSON.stringify(params)
    });

    const rawText = await response.text();
    const raw = rawText.length === 0 ? undefined : JSON.parse(rawText);
    if (!response.ok) {
      throw new Error(`Instagram outbound failed ${response.status}: ${rawText}`);
    }

    return {
      ok: true,
      providerMessageId: typeof raw?.message_id === "string" ? raw.message_id : undefined,
      raw
    };
  }
}

export class DisabledInstagramOutboundClient implements InstagramOutboundClient {
  async sendText(): Promise<InstagramSendResult> {
    throw new Error("Instagram outbound is not configured");
  }
}
