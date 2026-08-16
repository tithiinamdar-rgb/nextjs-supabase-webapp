export type PartnerId = 'partner1' | 'partner2' | 'both';

export interface PartnerProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  role: 'Partner 1' | 'Partner 2' | 'Managing Partner' | 'Associate Partner' | string;
  phone?: string;
}

export type PaymentType = 'to_pay' | 'to_collect';

export type PaymentStatus = 
  | 'Upcoming' 
  | 'Due Today' 
  | 'Overdue' 
  | 'Partially Paid' 
  | 'Completed' 
  | 'Cancelled';

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  amount: number;
  transactionDate: string;
  paymentMethod: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface PaymentItem {
  id: string;
  type: PaymentType;
  clientName: string;
  propertyName?: string;
  amount: number;
  amountCompleted: number;
  remainingAmount: number;
  dueDate: string;
  description?: string;
  phone?: string;
  assignedTo: string;
  status: PaymentStatus;
  notes?: string;
  reminderDate?: string;
  imageUrl?: string;
  receiptImages?: string[];
  archived?: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  transactions?: PaymentTransaction[];
}

export type ChitStatus = 'Active' | 'Matured' | 'Closed' | 'Archived';

export interface ChitItem {
  id: string;
  title: string;
  referenceNumber: string;
  personName: string;
  amount: number;
  date: string;
  maturityDate?: string;
  category: string;
  description?: string;
  status: ChitStatus;
  attachmentUrl?: string;
  archived?: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  pinned: boolean;
  imageUrl?: string;
  clientName?: string;
  archived?: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: TaskPriority;
  assignedTo: string;
  category: string;
  status: TaskStatus;
  amount?: number;
  imageUrl?: string;
  clientName?: string;
  preset?: string;
  completedAt?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderScheduleItem {
  id: string;
  date: string;
  note: string;
  preset?: string;
  completed: boolean;
  completedAt?: string;
}

export interface PhotoReminderItem {
  id: string;
  title: string;
  clientName: string;
  clientId?: string;
  amount?: number;
  imageUrl: string;
  reminderDate: string;
  preset: '1_day' | '2_days' | '7_days' | '15_days' | '30_days' | 'custom';
  notes?: string;
  status: 'Pending' | 'Completed' | 'Snoozed';
  completedAt?: string;
  remindersList?: ReminderScheduleItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  type: 'payment_due' | 'collection_due' | 'overdue' | 'task_due' | 'photo_reminder' | 'system';
  title: string;
  message: string;
  relatedRecordId?: string;
  section?: 'payments' | 'chits' | 'notes' | 'tasks';
  read: boolean;
  createdAt: string;
}

export type NavigationSection = 
  | 'dashboard' 
  | 'payments' 
  | 'chits' 
  | 'notes' 
  | 'tasks' 
  | 'search' 
  | 'settings';
