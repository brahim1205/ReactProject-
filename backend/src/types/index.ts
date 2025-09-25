export interface CreateTodoDto {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  userId: number;
  createdBy?: string;
  imageUrl?: string;
  audioUrl?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  completed?: boolean;
  assignedToId?: number | null;
  imageUrl?: string;
  audioUrl?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface TodoResponseDto {
  id: number;
  title: string;
  text?: string;
  description?: string;
  priority: string;
  status: string;
  completed: boolean;
  userId: number;
  user?: any;
  assignedToId?: number;
  assignedTo?: any;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  imageUrl?: string;
  audioUrl?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface ITodoService {
  getAllTodos(): Promise<TodoResponseDto[]>;
  getTodoById(id: number): Promise<TodoResponseDto | null>;
  createTodo(data: CreateTodoDto): Promise<TodoResponseDto>;
  updateTodo(id: number, data: UpdateTodoDto, senderId?: number): Promise<TodoResponseDto>;
  deleteTodo(id: number): Promise<void>;
  delegateTodo(id: number, assignedToId: number | null, senderId?: number): Promise<TodoResponseDto>;
  updateImage(id: number, imageUrl: string): Promise<TodoResponseDto>;
  updateAudio(id: number, audioUrl: string): Promise<TodoResponseDto>;
}

export interface ITodoRepository {
  create(data: CreateTodoDto): Promise<TodoResponseDto>;
  findAll(): Promise<TodoResponseDto[]>;
  findById(id: number): Promise<TodoResponseDto | null>;
  update(id: number, data: UpdateTodoDto): Promise<TodoResponseDto>;
  delete(id: number): Promise<void>;
}

export interface IValidationService {
  validateTodoCreation(data: CreateTodoDto): string[];
  validateTodoUpdate(data: UpdateTodoDto): string[];
  validateUserRegistration(data: CreateUserDto): string[];
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}