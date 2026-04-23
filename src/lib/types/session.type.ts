export interface ILearnerSession {
  id: string;
  deviceInfo: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
}
