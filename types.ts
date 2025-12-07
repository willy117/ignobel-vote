export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string; // Employee ID or Student ID
  email: string; // In this system, acting as verification/password
  name: string;
  role: UserRole;
  groupId?: string; // If student, which group they belong to
  hasVoted: boolean;
  docId?: string; // Firestore Document ID
}

export interface Group {
  id: string;
  title: string;
  members: string[]; // Names of students
  imageUrl: string;
  docId?: string; // Firestore Document ID
}

export interface VoteAllocation {
  groupId: string;
  count: number;
}

export interface VoteRecord {
  userId: string;
  allocations: VoteAllocation[];
  timestamp: number;
  docId?: string;
}

// Mock data removed. Data will be fetched from Firebase.
export const MOCK_USERS: User[] = [];
export const MOCK_GROUPS: Group[] = [];