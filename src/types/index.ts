// Types pour les hooks personnalisés
export interface AudioRecordingState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  hasRecording: boolean;
}

export interface AudioRecordingActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  resetRecording: () => void;
  cleanup: () => void;
}

export type UseAudioRecordingReturn = AudioRecordingState & AudioRecordingActions;

export interface FileUploadState {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  hasFile: boolean;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface FileUploadActions {
  handleFileSelect: (file: File | null) => void;
  clearFile: () => void;
  reset: () => void;
  cleanup: () => void;
}

export type UseFileUploadReturn = FileUploadState & FileUploadActions;

export interface TodoFormData {
  title: string;
  description?: string;
  priority: 'Basse' | 'Moyenne' | 'Urgente';
  userId: number;
  createdBy: string;
}

export interface TodoFilters {
  priority?: string;
  completed?: boolean;
  assignedToId?: number;
  userId?: number;
  search?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  userId: number;
  user?: User;
  assignedToId?: number;
  assignedTo?: User;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  imageUrl?: string;
  audioUrl?: string;
}

// Types pour les props des composants
export interface TodoItemProps {
  todo: Todo;
  onDelete: (id: number) => Promise<void>;
  onToggleComplete: (id: number) => Promise<void>;
  onUpdate: (id: number, title: string, priority: string) => Promise<void>;
  onAssign: (id: number, userId: number) => Promise<void>;
  currentUser: User | null;
  users: User[];
}

export interface AddTodoFormProps {
  onTodoAdded: (todo: Todo) => void;
  currentUser: User | null;
}

export interface TodoListProps {
  todos: Todo[];
  users: User[];
  currentUser: User | null;
  filter: string;
  search: string;
  onToggleComplete: (id: number) => Promise<void>;
  onUpdate: (id: number, title: string, priority: string) => Promise<void>;
  onAssign: (id: number, userId: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}

// Types pour les services API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types pour les erreurs
export class ValidationError extends Error {
  constructor(public field: string, public message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Types pour les enums
export const Priority = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Urgente'
} as const;

export type PriorityType = typeof Priority[keyof typeof Priority];

export const FilterType = {
  ALL: 'Tous',
  URGENT: 'Urgente',
  MEDIUM: 'Moyenne',
  LOW: 'Basse',
  MY_TASKS: 'Mes tâches',
  ASSIGNED_TO_ME: 'Assignées à moi'
} as const;

export type FilterTypeValue = typeof FilterType[keyof typeof FilterType];