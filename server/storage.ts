import { users, extractionJobs, type User, type InsertUser, type ExtractionJob, type InsertExtractionJob } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createExtractionJob(job: InsertExtractionJob): Promise<ExtractionJob>;
  getExtractionJob(id: number): Promise<ExtractionJob | undefined>;
  updateExtractionJob(id: number, updates: Partial<ExtractionJob>): Promise<ExtractionJob | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private extractionJobs: Map<number, ExtractionJob>;
  private currentUserId: number;
  private currentJobId: number;

  constructor() {
    this.users = new Map();
    this.extractionJobs = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createExtractionJob(insertJob: InsertExtractionJob): Promise<ExtractionJob> {
    const id = this.currentJobId++;
    const job: ExtractionJob = {
      ...insertJob,
      id,
      status: "pending",
      commentCount: null,
      jsonData: null,
      textData: null,
      error: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.extractionJobs.set(id, job);
    return job;
  }

  async getExtractionJob(id: number): Promise<ExtractionJob | undefined> {
    return this.extractionJobs.get(id);
  }

  async updateExtractionJob(id: number, updates: Partial<ExtractionJob>): Promise<ExtractionJob | undefined> {
    const job = this.extractionJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.extractionJobs.set(id, updatedJob);
    return updatedJob;
  }
}

export const storage = new MemStorage();
