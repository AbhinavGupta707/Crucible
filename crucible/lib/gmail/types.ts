export type GmailTokens = {
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  scope?: string;
  tokenType?: string;
  idToken?: string;
};

export type GmailConnection = {
  id: string;
  workspaceId: string;
  emailAddress: string;
  tokens: GmailTokens;
  createdAt: Date;
  updatedAt: Date;
};

export type RecipientAddress = {
  email: string;
  name?: string;
};

export type OutboundMimeInput = {
  from: RecipientAddress;
  to: RecipientAddress[];
  cc?: RecipientAddress[];
  bcc?: RecipientAddress[];
  subject: string;
  text: string;
  html?: string;
  inReplyTo?: string;
  references?: string[];
  date?: Date;
  messageId?: string;
};

export type GmailDraftResult = {
  draftId: string;
  threadId?: string;
  messageId?: string;
};

export type GmailSendResult = {
  messageId: string;
  threadId: string;
};

export type GmailReply = {
  messageId: string;
  threadId: string;
  fromEmail: string;
  fromName?: string;
  toEmails: string[];
  subject: string;
  receivedAt: Date;
  inReplyTo?: string;
  references: string[];
  plainText: string;
  snippet: string;
  raw?: unknown;
};

export type ApprovedEmail = {
  emailId: string;
  to: RecipientAddress;
  subject: string;
  body: string;
  approved: boolean;
  threadId?: string;
  inReplyTo?: string;
};

export type GmailFailure = {
  ok: false;
  reason:
    | "demo_safe_mode"
    | "not_connected"
    | "not_approved"
    | "outside_allowlist"
    | "suppressed"
    | "missing_credentials"
    | "api_error"
    | "invalid_input";
  message: string;
  details?: unknown;
};

export type GmailOk<T> = { ok: true; data: T };
export type GmailResult<T> = GmailOk<T> | GmailFailure;
