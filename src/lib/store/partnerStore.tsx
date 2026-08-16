'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PartnerProfile, 
  PaymentItem, 
  PaymentTransaction,
  ChitItem, 
  NoteItem, 
  TaskItem, 
  AppNotification, 
  NavigationSection 
} from '@/types';
import { createClient } from '@/lib/supabase/client';

export const DEFAULT_PARTNERS: PartnerProfile[] = [
  {
    id: 'partner1',
    name: 'Partner 1',
    email: 'partner1@partnerdesk.local',
    initials: 'P1',
    role: 'Partner 1',
    phone: '',
  },
  {
    id: 'partner2',
    name: 'Partner 2',
    email: 'partner2@partnerdesk.local',
    initials: 'P2',
    role: 'Partner 2',
    phone: '',
  }
];

// Clean empty state - No fake or sample data
const INITIAL_PAYMENTS: PaymentItem[] = [];
const INITIAL_CHITS: ChitItem[] = [];
const INITIAL_NOTES: NoteItem[] = [];
const INITIAL_TASKS: TaskItem[] = [];

interface PartnerStoreContextType {
  activePartner: PartnerProfile;
  setActivePartner: (partner: PartnerProfile) => void;
  partners: PartnerProfile[];
  currentSection: NavigationSection;
  setCurrentSection: (section: NavigationSection) => void;
  
  // Payments
  payments: PaymentItem[];
  addPayment: (payment: Omit<PaymentItem, 'id' | 'remainingAmount' | 'createdAt' | 'updatedAt' | 'amountCompleted' | 'transactions'>) => Promise<PaymentItem>;
  updatePayment: (id: string, updates: Partial<PaymentItem>) => Promise<void>;
  deletePayment: (id: string, permanent?: boolean) => Promise<void>;
  recordPaymentTransaction: (paymentId: string, amount: number, paymentMethod: string, notes?: string) => Promise<void>;
  
  // Chits
  chits: ChitItem[];
  addChit: (chit: Omit<ChitItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ChitItem>;
  updateChit: (id: string, updates: Partial<ChitItem>) => Promise<void>;
  deleteChit: (id: string, permanent?: boolean) => Promise<void>;
  
  // Notes
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<NoteItem>;
  updateNote: (id: string, updates: Partial<NoteItem>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  
  // Tasks
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TaskItem>;
  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  moveTaskToTomorrow: (id: string) => Promise<void>;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;

  // Modals & UI triggers
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddDefaultTab: 'payment_pay' | 'payment_collect' | 'chit' | 'note' | 'task';
  openQuickAdd: (tab?: 'payment_pay' | 'payment_collect' | 'chit' | 'note' | 'task') => void;
  
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  
  isRecordPaymentOpen: boolean;
  recordPaymentTarget: PaymentItem | null;
  openRecordPaymentModal: (payment: PaymentItem) => void;
  closeRecordPaymentModal: () => void;

  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Dashboard Metrics & Insights
  metrics: {
    totalToCollect: number;
    totalToPay: number;
    collectedThisMonth: number;
    paidThisMonth: number;
    overduePaymentsCount: number;
    overduePaymentsAmount: number;
    overdueCollectionsCount: number;
    overdueCollectionsAmount: number;
    dueTodayCount: number;
    dueNext3DaysCount: number;
    pendingTasksTodayCount: number;
    activeChitsCount: number;
    activeChitsTotal: number;
  };

  // Sync state
  isSupabaseConnected: boolean;
  isSyncing: boolean;
}

const PartnerStoreContext = createContext<PartnerStoreContextType | null>(null);

export function PartnerStoreProvider({ children }: { children: React.ReactNode }) {
  const [activePartner, setActivePartnerState] = useState<PartnerProfile>(DEFAULT_PARTNERS[0]);
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  
  const [payments, setPayments] = useState<PaymentItem[]>(INITIAL_PAYMENTS);
  const [chits, setChits] = useState<ChitItem[]>(INITIAL_CHITS);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaultTab, setQuickAddDefaultTab] = useState<'payment_pay' | 'payment_collect' | 'chit' | 'note' | 'task'>('payment_collect');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [recordPaymentTarget, setRecordPaymentTarget] = useState<PaymentItem | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // Set active partner with persistence
  const setActivePartner = useCallback((partner: PartnerProfile) => {
    setActivePartnerState(partner);
    if (typeof window !== 'undefined') {
      localStorage.setItem('partnerdesk_active_partner', JSON.stringify(partner));
    }
  }, []);

  // Load cache from localStorage on mount (cleaning any previous demo data)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedPartner = localStorage.getItem('partnerdesk_active_partner');
      if (savedPartner) setActivePartnerState(JSON.parse(savedPartner));

      const savedPayments = localStorage.getItem('partnerdesk_payments');
      if (savedPayments) {
        const parsed = JSON.parse(savedPayments);
        // Filter out any legacy mock data
        const clean = parsed.filter((p: any) => !p.id.startsWith('pay-1') && !p.id.startsWith('pay-2') && !p.id.startsWith('pay-3') && !p.id.startsWith('pay-4'));
        setPayments(clean);
      }

      const savedChits = localStorage.getItem('partnerdesk_chits');
      if (savedChits) {
        const parsed = JSON.parse(savedChits);
        const clean = parsed.filter((c: any) => !c.id.startsWith('chit-1') && !c.id.startsWith('chit-2'));
        setChits(clean);
      }

      const savedNotes = localStorage.getItem('partnerdesk_notes');
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        const clean = parsed.filter((n: any) => !n.id.startsWith('note-1') && !n.id.startsWith('note-2') && !n.id.startsWith('note-3'));
        setNotes(clean);
      }

      const savedTasks = localStorage.getItem('partnerdesk_tasks');
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        const clean = parsed.filter((t: any) => !t.id.startsWith('task-1') && !t.id.startsWith('task-2') && !t.id.startsWith('task-3'));
        setTasks(clean);
      }
    } catch (e) {
      console.warn('LocalStorage load:', e);
    }
  }, []);

  // Persist local store
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('partnerdesk_payments', JSON.stringify(payments));
      localStorage.setItem('partnerdesk_chits', JSON.stringify(chits));
      localStorage.setItem('partnerdesk_notes', JSON.stringify(notes));
      localStorage.setItem('partnerdesk_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage save:', e);
    }
  }, [payments, chits, notes, tasks]);

  // Global Keyboard Shortcuts (Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Supabase Initial Sync
  useEffect(() => {
    const fetchSupabaseData = async () => {
      if (!supabase) return;
      setIsSyncing(true);
      try {
        const { data: dbPayments, error: pError } = await supabase.from('payments').select('*, transactions:payment_transactions(*)').order('created_at', { ascending: false });
        if (!pError && dbPayments) {
          const mapped: PaymentItem[] = dbPayments.map(p => ({
            id: p.id,
            type: p.type,
            clientName: p.client_name,
            propertyName: p.property_name,
            amount: Number(p.amount),
            amountCompleted: Number(p.amount_completed || 0),
            remainingAmount: Number(p.remaining_amount || (p.amount - (p.amount_completed || 0))),
            dueDate: p.due_date,
            description: p.description,
            phone: p.phone,
            assignedTo: p.assigned_to,
            status: p.status,
            notes: p.notes,
            reminderDate: p.reminder_date,
            archived: p.archived,
            createdBy: p.created_by,
            updatedBy: p.updated_by,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            transactions: p.transactions ? p.transactions.map((t: any) => ({
              id: t.id,
              paymentId: t.payment_id,
              amount: Number(t.amount),
              transactionDate: t.transaction_date,
              paymentMethod: t.payment_method || 'Transfer',
              notes: t.notes,
              recordedBy: t.recorded_by,
              createdAt: t.created_at
            })) : []
          }));
          setPayments(mapped);
          setIsSupabaseConnected(true);
        }

        const { data: dbChits, error: cError } = await supabase.from('chits').select('*').order('created_at', { ascending: false });
        if (!cError && dbChits) {
          setChits(dbChits.map(c => ({
            id: c.id,
            title: c.title,
            referenceNumber: c.reference_number,
            personName: c.person_name,
            amount: Number(c.amount),
            date: c.date,
            maturityDate: c.maturity_date,
            category: c.category,
            description: c.description,
            status: c.status,
            attachmentUrl: c.attachment_url,
            archived: c.archived,
            createdBy: c.created_by,
            updatedBy: c.updated_by,
            createdAt: c.created_at,
            updatedAt: c.updated_at
          })));
        }

        const { data: dbNotes, error: nError } = await supabase.from('notes').select('*').order('pinned', { ascending: false });
        if (!nError && dbNotes) {
          setNotes(dbNotes.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            category: n.category,
            tags: n.tags || [],
            pinned: Boolean(n.pinned),
            archived: Boolean(n.archived),
            createdBy: n.created_by,
            updatedBy: n.updated_by,
            createdAt: n.created_at,
            updatedAt: n.updated_at
          })));
        }

        const { data: dbTasks, error: tError } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
        if (!tError && dbTasks) {
          setTasks(dbTasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            dueDate: t.due_date,
            dueTime: t.due_time,
            priority: t.priority,
            assignedTo: t.assigned_to,
            category: t.category,
            status: t.status,
            createdBy: t.created_by,
            updatedBy: t.updated_by,
            createdAt: t.created_at,
            updatedAt: t.updated_at
          })));
        }
      } catch (err) {
        console.log('Supabase sync notice: Operating with responsive local cache.', err);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchSupabaseData();
  }, [supabase]);

  // Dynamic Realtime Reminders & Notifications Engine
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const generated: AppNotification[] = [];

    // Overdue / Upcoming Payments
    payments.forEach(p => {
      if (p.status === 'Completed' || p.archived) return;

      if (p.dueDate < todayStr) {
        generated.push({
          id: `notif-overdue-${p.id}`,
          type: 'overdue',
          section: 'payments',
          relatedRecordId: p.id,
          title: `⚠️ Overdue ${p.type === 'to_collect' ? 'Collection' : 'Payment'}`,
          message: `${p.clientName} - ₹${(p.remainingAmount || p.amount).toLocaleString('en-IN')} was due on ${p.dueDate}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      } else if (p.dueDate === todayStr) {
        generated.push({
          id: `notif-today-${p.id}`,
          type: p.type === 'to_collect' ? 'collection_due' : 'payment_due',
          section: 'payments',
          relatedRecordId: p.id,
          title: `📅 ${p.type === 'to_collect' ? 'Money to Collect' : 'Payment to Make'} Due Today`,
          message: `${p.clientName} - ₹${(p.remainingAmount || p.amount).toLocaleString('en-IN')}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Today's Pending Tasks
    tasks.forEach(t => {
      if (t.status === 'Completed' || t.status === 'Cancelled') return;
      if (t.dueDate <= todayStr) {
        generated.push({
          id: `notif-task-${t.id}`,
          type: 'task_due',
          section: 'tasks',
          relatedRecordId: t.id,
          title: `📋 Task Due Today: ${t.title}`,
          message: `Priority: ${t.priority} • Assigned: ${t.assignedTo} ${t.dueTime ? `(${t.dueTime})` : ''}`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    setNotifications(generated);
  }, [payments, tasks]);

  // Dashboard Metrics Calculation
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const threeDaysStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    let totalToCollect = 0;
    let totalToPay = 0;
    let collectedThisMonth = 0;
    let paidThisMonth = 0;
    let overduePaymentsCount = 0;
    let overduePaymentsAmount = 0;
    let overdueCollectionsCount = 0;
    let overdueCollectionsAmount = 0;
    let dueTodayCount = 0;
    let dueNext3DaysCount = 0;

    payments.forEach(p => {
      if (p.archived) return;

      const remaining = p.remainingAmount !== undefined ? p.remainingAmount : (p.amount - p.amountCompleted);

      if (p.type === 'to_collect') {
        if (p.status !== 'Completed' && p.status !== 'Cancelled') {
          totalToCollect += remaining;
        }
        collectedThisMonth += p.amountCompleted || 0;

        if (p.dueDate < todayStr && p.status !== 'Completed' && p.status !== 'Cancelled') {
          overdueCollectionsCount++;
          overdueCollectionsAmount += remaining;
        }
      } else {
        if (p.status !== 'Completed' && p.status !== 'Cancelled') {
          totalToPay += remaining;
        }
        paidThisMonth += p.amountCompleted || 0;

        if (p.dueDate < todayStr && p.status !== 'Completed' && p.status !== 'Cancelled') {
          overduePaymentsCount++;
          overduePaymentsAmount += remaining;
        }
      }

      if (p.status !== 'Completed' && p.status !== 'Cancelled') {
        if (p.dueDate === todayStr) dueTodayCount++;
        else if (p.dueDate > todayStr && p.dueDate <= threeDaysStr) dueNext3DaysCount++;
      }
    });

    const pendingTasksTodayCount = tasks.filter(t => 
      t.status !== 'Completed' && t.status !== 'Cancelled' && t.dueDate <= todayStr
    ).length;

    const activeChits = chits.filter(c => c.status === 'Active' && !c.archived);
    const activeChitsTotal = activeChits.reduce((sum, c) => sum + c.amount, 0);

    return {
      totalToCollect,
      totalToPay,
      collectedThisMonth,
      paidThisMonth,
      overduePaymentsCount,
      overduePaymentsAmount,
      overdueCollectionsCount,
      overdueCollectionsAmount,
      dueTodayCount,
      dueNext3DaysCount,
      pendingTasksTodayCount,
      activeChitsCount: activeChits.length,
      activeChitsTotal,
    };
  }, [payments, tasks, chits]);

  // Notifications Helpers
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Open Quick Add helper
  const openQuickAdd = (tab?: 'payment_pay' | 'payment_collect' | 'chit' | 'note' | 'task') => {
    if (tab) setQuickAddDefaultTab(tab);
    setIsQuickAddOpen(true);
  };

  // Open Record Payment Modal
  const openRecordPaymentModal = (payment: PaymentItem) => {
    setRecordPaymentTarget(payment);
    setIsRecordPaymentOpen(true);
  };

  const closeRecordPaymentModal = () => {
    setIsRecordPaymentOpen(false);
    setRecordPaymentTarget(null);
  };

  // ================= PAYMENTS CRUD =================
  const addPayment = async (paymentData: Omit<PaymentItem, 'id' | 'remainingAmount' | 'createdAt' | 'updatedAt' | 'amountCompleted' | 'transactions'>): Promise<PaymentItem> => {
    const newId = `pay-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];
    
    let calculatedStatus: any = paymentData.status || 'Upcoming';
    if (paymentData.dueDate < todayStr) calculatedStatus = 'Overdue';
    else if (paymentData.dueDate === todayStr) calculatedStatus = 'Due Today';

    const newPayment: PaymentItem = {
      ...paymentData,
      id: newId,
      amountCompleted: 0,
      remainingAmount: paymentData.amount,
      status: calculatedStatus,
      createdBy: activePartner.name,
      updatedBy: activePartner.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      transactions: []
    };

    setPayments(prev => [newPayment, ...prev]);

    // Async write to Supabase if connected
    if (supabase) {
      try {
        await supabase.from('payments').insert([{
          type: newPayment.type,
          client_name: newPayment.clientName,
          property_name: newPayment.propertyName,
          amount: newPayment.amount,
          amount_completed: 0,
          due_date: newPayment.dueDate,
          description: newPayment.description,
          phone: newPayment.phone,
          assigned_to: newPayment.assignedTo,
          status: newPayment.status,
          reminder_date: newPayment.reminderDate,
          notes: newPayment.notes,
          created_by: newPayment.createdBy,
        }]);
      } catch (err) {
        console.warn('Supabase async save:', err);
      }
    }

    return newPayment;
  };

  const updatePayment = async (id: string, updates: Partial<PaymentItem>) => {
    setPayments(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { 
        ...p, 
        ...updates, 
        updatedBy: activePartner.name,
        updatedAt: new Date().toISOString() 
      };
      if (updates.amount !== undefined || updates.amountCompleted !== undefined) {
        const amt = updates.amount !== undefined ? updates.amount : p.amount;
        const comp = updates.amountCompleted !== undefined ? updates.amountCompleted : p.amountCompleted;
        updated.remainingAmount = amt - comp;
      }
      return updated;
    }));

    if (supabase) {
      try {
        const dbPayload: any = { updated_by: activePartner.name, updated_at: new Date().toISOString() };
        if (updates.clientName) dbPayload.client_name = updates.clientName;
        if (updates.propertyName !== undefined) dbPayload.property_name = updates.propertyName;
        if (updates.amount !== undefined) dbPayload.amount = updates.amount;
        if (updates.dueDate) dbPayload.due_date = updates.dueDate;
        if (updates.status) dbPayload.status = updates.status;
        if (updates.notes !== undefined) dbPayload.notes = updates.notes;
        if (updates.phone !== undefined) dbPayload.phone = updates.phone;
        if (updates.assignedTo) dbPayload.assigned_to = updates.assignedTo;

        await supabase.from('payments').update(dbPayload).eq('id', id);
      } catch (err) {
        console.warn('Supabase update error:', err);
      }
    }
  };

  const deletePayment = async (id: string, permanent = false) => {
    if (permanent) {
      setPayments(prev => prev.filter(p => p.id !== id));
      if (supabase) await supabase.from('payments').delete().eq('id', id);
    } else {
      await updatePayment(id, { archived: true });
    }
  };

  const recordPaymentTransaction = async (paymentId: string, amount: number, paymentMethod: string, notes?: string) => {
    const txId = `tx-${Date.now()}`;
    const tx: PaymentTransaction = {
      id: txId,
      paymentId,
      amount,
      transactionDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      notes,
      recordedBy: activePartner.name,
      createdAt: new Date().toISOString()
    };

    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p;
      const newAmountCompleted = (p.amountCompleted || 0) + amount;
      const newRemaining = p.amount - newAmountCompleted;
      const newStatus = newRemaining <= 0 ? 'Completed' : 'Partially Paid';
      const existingTx = p.transactions || [];

      return {
        ...p,
        amountCompleted: newAmountCompleted,
        remainingAmount: newRemaining,
        status: newStatus,
        updatedBy: activePartner.name,
        updatedAt: new Date().toISOString(),
        transactions: [tx, ...existingTx]
      };
    }));

    if (supabase) {
      try {
        await supabase.from('payment_transactions').insert([{
          payment_id: paymentId,
          amount,
          transaction_date: tx.transactionDate,
          payment_method: paymentMethod,
          notes,
          recorded_by: activePartner.name,
        }]);
      } catch (err) {
        console.warn('Supabase tx log error:', err);
      }
    }
  };

  // ================= CHITS CRUD =================
  const addChit = async (chitData: Omit<ChitItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChitItem> => {
    const newId = `chit-${Date.now()}`;
    const newChit: ChitItem = {
      ...chitData,
      id: newId,
      createdBy: activePartner.name,
      updatedBy: activePartner.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setChits(prev => [newChit, ...prev]);

    if (supabase) {
      try {
        await supabase.from('chits').insert([{
          title: newChit.title,
          reference_number: newChit.referenceNumber,
          person_name: newChit.personName,
          amount: newChit.amount,
          date: newChit.date,
          maturity_date: newChit.maturityDate,
          category: newChit.category,
          description: newChit.description,
          status: newChit.status,
          attachment_url: newChit.attachmentUrl,
          created_by: newChit.createdBy
        }]);
      } catch (err) {
        console.warn('Supabase chit insert error:', err);
      }
    }

    return newChit;
  };

  const updateChit = async (id: string, updates: Partial<ChitItem>) => {
    setChits(prev => prev.map(c => c.id === id ? { 
      ...c, 
      ...updates, 
      updatedBy: activePartner.name, 
      updatedAt: new Date().toISOString() 
    } : c));

    if (supabase) {
      try {
        const dbPayload: any = { updated_by: activePartner.name, updated_at: new Date().toISOString() };
        if (updates.title) dbPayload.title = updates.title;
        if (updates.status) dbPayload.status = updates.status;
        if (updates.amount !== undefined) dbPayload.amount = updates.amount;
        if (updates.category) dbPayload.category = updates.category;
        if (updates.description !== undefined) dbPayload.description = updates.description;
        await supabase.from('chits').update(dbPayload).eq('id', id);
      } catch (err) {
        console.warn('Supabase chit update error:', err);
      }
    }
  };

  const deleteChit = async (id: string, permanent = false) => {
    if (permanent) {
      setChits(prev => prev.filter(c => c.id !== id));
      if (supabase) await supabase.from('chits').delete().eq('id', id);
    } else {
      await updateChit(id, { archived: true });
    }
  };

  // ================= NOTES CRUD =================
  const addNote = async (noteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteItem> => {
    const newId = `note-${Date.now()}`;
    const newNote: NoteItem = {
      ...noteData,
      id: newId,
      createdBy: activePartner.name,
      updatedBy: activePartner.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);

    if (supabase) {
      try {
        await supabase.from('notes').insert([{
          title: newNote.title,
          content: newNote.content,
          category: newNote.category,
          tags: newNote.tags,
          pinned: newNote.pinned,
          created_by: newNote.createdBy
        }]);
      } catch (err) {
        console.warn('Supabase note insert error:', err);
      }
    }

    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => n.id === id ? { 
      ...n, 
      ...updates, 
      updatedBy: activePartner.name, 
      updatedAt: new Date().toISOString() 
    } : n));

    if (supabase) {
      try {
        const dbPayload: any = { updated_by: activePartner.name, updated_at: new Date().toISOString() };
        if (updates.title !== undefined) dbPayload.title = updates.title;
        if (updates.content !== undefined) dbPayload.content = updates.content;
        if (updates.category !== undefined) dbPayload.category = updates.category;
        if (updates.tags !== undefined) dbPayload.tags = updates.tags;
        if (updates.pinned !== undefined) dbPayload.pinned = updates.pinned;
        await supabase.from('notes').update(dbPayload).eq('id', id);
      } catch (err) {
        console.warn('Supabase note update error:', err);
      }
    }
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (supabase) await supabase.from('notes').delete().eq('id', id);
  };

  const togglePinNote = async (id: string) => {
    const target = notes.find(n => n.id === id);
    if (!target) return;
    await updateNote(id, { pinned: !target.pinned });
  };

  // ================= TASKS CRUD =================
  const addTask = async (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskItem> => {
    const newId = `task-${Date.now()}`;
    const newTask: TaskItem = {
      ...taskData,
      id: newId,
      createdBy: activePartner.name,
      updatedBy: activePartner.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    if (supabase) {
      try {
        await supabase.from('tasks').insert([{
          title: newTask.title,
          description: newTask.description,
          due_date: newTask.dueDate,
          due_time: newTask.dueTime,
          priority: newTask.priority,
          assigned_to: newTask.assignedTo,
          category: newTask.category,
          status: newTask.status,
          created_by: newTask.createdBy
        }]);
      } catch (err) {
        console.warn('Supabase task insert error:', err);
      }
    }

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, 
      ...updates, 
      updatedBy: activePartner.name, 
      updatedAt: new Date().toISOString() 
    } : t));

    if (supabase) {
      try {
        const dbPayload: any = { updated_by: activePartner.name, updated_at: new Date().toISOString() };
        if (updates.title !== undefined) dbPayload.title = updates.title;
        if (updates.description !== undefined) dbPayload.description = updates.description;
        if (updates.dueDate !== undefined) dbPayload.due_date = updates.dueDate;
        if (updates.dueTime !== undefined) dbPayload.due_time = updates.dueTime;
        if (updates.priority !== undefined) dbPayload.priority = updates.priority;
        if (updates.assignedTo !== undefined) dbPayload.assigned_to = updates.assignedTo;
        if (updates.status !== undefined) dbPayload.status = updates.status;
        await supabase.from('tasks').update(dbPayload).eq('id', id);
      } catch (err) {
        console.warn('Supabase task update error:', err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (supabase) await supabase.from('tasks').delete().eq('id', id);
  };

  const toggleTaskComplete = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const newStatus = target.status === 'Completed' ? 'Pending' : 'Completed';
    await updateTask(id, { status: newStatus });
  };

  const moveTaskToTomorrow = async (id: string) => {
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    await updateTask(id, { dueDate: tomorrowStr, status: 'Pending' });
  };

  return (
    <PartnerStoreContext.Provider
      value={{
        activePartner,
        setActivePartner,
        partners: DEFAULT_PARTNERS,
        currentSection,
        setCurrentSection,
        payments,
        addPayment,
        updatePayment,
        deletePayment,
        recordPaymentTransaction,
        chits,
        addChit,
        updateChit,
        deleteChit,
        notes,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        moveTaskToTomorrow,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddDefaultTab,
        openQuickAdd,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isRecordPaymentOpen,
        recordPaymentTarget,
        openRecordPaymentModal,
        closeRecordPaymentModal,
        isNotificationsOpen,
        setIsNotificationsOpen,
        metrics,
        isSupabaseConnected,
        isSyncing
      }}
    >
      {children}
    </PartnerStoreContext.Provider>
  );
}

export function usePartnerStore() {
  const context = useContext(PartnerStoreContext);
  if (!context) throw new Error('usePartnerStore must be used within a PartnerStoreProvider');
  return context;
}
