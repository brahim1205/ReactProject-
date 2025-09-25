import { PrismaClient } from '@prisma/client';
import { ITodoRepository, CreateTodoDto, UpdateTodoDto, TodoResponseDto } from '../types/index.js';
export class TodoRepository implements ITodoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTodoDto): Promise<TodoResponseDto> {
    const todo = await this.prisma.todo.create({
      data: {
        title: data.title.trim(),
        description: data.description || null,
        priority: data.priority || 'Moyenne',
        status: data.status || 'pending',
        userId: data.userId,
        createdBy: data.createdBy || 'Utilisateur',
        imageUrl: data.imageUrl || null,
        audioUrl: data.audioUrl || null,
        startDateTime: data.startDateTime ? new Date(data.startDateTime) : null,
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.mapToResponseDto(todo);
  }

  async findAll(): Promise<TodoResponseDto[]> {
    const todos = await this.prisma.todo.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return todos.map(todo => this.mapToResponseDto(todo));
  }

  async findById(id: number): Promise<TodoResponseDto | null> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return todo ? this.mapToResponseDto(todo) : null;
  }

  async update(id: number, data: UpdateTodoDto): Promise<TodoResponseDto> {
    const updateData: any = {};

    if (data.title !== undefined) {
      updateData.title = data.title.trim();
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      if (data.completed) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.audioUrl !== undefined) updateData.audioUrl = data.audioUrl;
    if (data.startDateTime !== undefined) updateData.startDateTime = data.startDateTime ? new Date(data.startDateTime) : null;
    if (data.endDateTime !== undefined) updateData.endDateTime = data.endDateTime ? new Date(data.endDateTime) : null;

    updateData.updatedAt = new Date();

    const todo = await this.prisma.todo.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return this.mapToResponseDto(todo);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.todo.delete({
      where: { id },
    });
  }

  private mapToResponseDto(todo: any): TodoResponseDto {
    return {
      id: todo.id,
      title: todo.title,
      text: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status,
      completed: todo.completed,
      userId: todo.userId,
      user: todo.user,
      assignedToId: todo.assignedToId,
      assignedTo: todo.assignedTo,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt?.toISOString(),
      completedAt: todo.completedAt?.toISOString(),
      createdBy: todo.createdBy,
      updatedBy: todo.updatedBy,
      imageUrl: todo.imageUrl,
      audioUrl: todo.audioUrl,
      startDateTime: todo.startDateTime?.toISOString(),
      endDateTime: todo.endDateTime?.toISOString(),
    };
  }
}