export const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    GOOGLE: "/auth/google",
  },
  LEARNER: {
    ME: "/learners/me",
  },
  COLLECTIONS: {
    ROOT: "/collections",
    ONE: (id: string) => `/collections/${id}`,
    MASTERY: (id: string) => `/collections/${id}/mastery`,
  },
  DOCUMENTS: {
    ROOT: "/documents",
    UPLOAD: "/documents/upload",
    STATUS: (id: string) => `/documents/${id}/status`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    SUMMARY: (id: string) => `/documents/${id}/summary`,
    GENERATE_SUMMARY: (id: string) => `/documents/${id}/summary`,
    DELETE: (id: string) => `/documents/${id}`,
    ASSIGN_COLLECTION: (id: string) => `/documents/${id}/collection`,
  },
  GRAPH: {
    TOPOLOGY: "/progress/graph",
    WEAK_NODES: "/progress/weak-nodes",
  },
  PROGRESS: {
    DASHBOARD: "/progress/dashboard",
  },
  SESSIONS: {
    START: "/sessions/start",
    RESPOND: "/sessions/respond",
    END: "/sessions/end",
    ANALYSIS: (id: string) => `/sessions/${id}/analysis`,
  },
  CONTENT: {
    EXPLANATION: "/content/explanation",
  },
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    CONVERSATION: (id: string) => `/chat/conversations/${id}`,
    MESSAGES: (id: string) => `/chat/conversations/${id}/messages`,
    TOKEN_USAGE: "/chat/token-usage",
    SESSIONS: "/chat/sessions",
  },
} as const;
