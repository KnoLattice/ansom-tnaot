// ─── Auth ─────────────────────────────────────────────
export interface Learner {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  learner: Learner;
}

// ─── Documents ────────────────────────────────────────
export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
  id: string;
  originalName: string;
  fileSizeBytes: string;
  processingStatus: ProcessingStatus;
  uploadedAt: string;
  processedAt: string | null;
}

export interface DocumentsResponse {
  documents: Document[];
  quota: {
    usedMB: string;
    totalMB: string;
    remainingMB: string;
    percentUsed: string;
  };
}

export interface UploadResponse {
  documentId: string;
  status: ProcessingStatus;
  filename: string;
  fileSizeMB: string;
  usedMB: string;
  quotaMB: string;
  message: string;
}

export interface DocumentStatusResponse {
  id: string;
  originalName: string;
  processingStatus: ProcessingStatus;
  errorMessage?: string | null;
  uploadedAt: string;
  processedAt: string | null;
}

// ─── Graph ────────────────────────────────────────────
export type MasteryBand = "mastered" | "proficient" | "developing" | "low";
export type RelationshipType = "prerequisite" | "part_of" | "related";

export interface GraphNode {
  id: string;
  title: string;
  description: string;
  masteryScore: number;
  masteryBand: MasteryBand;
  isEligible: boolean;
  isLocked: boolean;
  graphDepth: number;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: RelationshipType;
  confidenceScore: number;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─── Session ──────────────────────────────────────────
export type QuestionType = "qcm" | "short_answer";

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  id: string;
  questionType: QuestionType;
  content: string;
  options?: QuestionOption[] | null;
  /** Sent by backend for QCM questions; null for short_answer */
  correctAnswer?: string | null;
  bloomLevel: number;
  difficulty: number;
}

export interface TargetNode {
  id: string;
  title: string;
  description?: string;
  masteryScore: number;
  masteryBand: MasteryBand;
  priorityScore: number;
}

export interface SessionStats {
  totalNodes: number;
  eligibleNodes: number;
  lockedNodes: number;
}

export interface StartSessionResponse {
  sessionId: string;
  documentId: string;
  questionType: QuestionType;
  targetNode: TargetNode;
  sessionStats: SessionStats;
  question: Question | null;
}

export interface FeedbackResult {
  isCorrect: boolean;
  evaluatorFeedback: string;
  correctAnswer: string;
  masteryBefore: number;
  masteryAfter: number;
  masteryDelta: number;
  masteryBand: MasteryBand;
}

export interface RespondResponse {
  feedback: FeedbackResult;
  sessionComplete: boolean;
  nextNode: TargetNode | null;
  question: Question | null;
}

export interface NodeStudied {
  nodeId: string;
  masteryBefore: number;
  masteryAfter: number;
  delta: number;
}

export interface EndSessionResponse {
  sessionId: string;
  durationMs: number;
  durationMinutes: number;
  totalInteractions: number;
  correctCount: number;
  accuracy: number;
  sessionAccuracy: number;
  nodesStudied: NodeStudied[];
}

// ─── Progress ─────────────────────────────────────────
export interface WeakNode {
  id: string;
  title: string;
  masteryScore: number;
  masteryPercent: number;
  lastInteractionAt: string | null;
  urgency: "critical" | "high" | "medium";
}

export interface SessionHistoryEntry {
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  totalInteractions: number;
  accuracyPercent: number | null;
}

export interface ProgressDashboardResponse {
  overallMasteryPercent: number;
  totalNodes: number;
  distribution: {
    mastered: number;
    proficient: number;
    developing: number;
    low: number;
  };
  nodes: Array<{
    id: string;
    title: string;
    masteryScore: number;
    masteryPercent: number;
    masteryBand: MasteryBand;
    lastInteractionAt: string | null;
    isEligible: boolean;
    isLocked: boolean;
    graphDepth: number;
  }>;
  weakNodes: WeakNode[];
  sessionHistory: SessionHistoryEntry[];
}

// ─── Content ──────────────────────────────────────────
export interface ExplanationResponse {
  id: string;
  title: string;
  description: string;
  sourceSnippets: string | null;
  graphDepth: number;
}

// ─── Errors ───────────────────────────────────────────
export interface APIError {
  statusCode: number;
  message: string;
  error: string;
}
