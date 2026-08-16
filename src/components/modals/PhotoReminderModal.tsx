'use client';

import React, { useState, useRef, useMemo } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Camera, 
  Upload, 
  X, 
  IndianRupee, 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  Image as ImageIcon, 
  Check, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Bell 
} from 'lucide-react';
import { ReminderScheduleItem } from '@/types';

interface PhotoReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhotoReminderModal({ isOpen, onClose }: PhotoReminderModalProps) {
  const { addPhotoReminder, activePartner, payments } = usePartnerStore();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [amount, setAmount] = useState('');
  
  // Primary preset
  const [selectedPreset, setSelectedPreset] = useState<'1_day' | '2_days' | '7_days' | '15_days' | '30_days' | 'custom'>('1_day');
  const [primaryCustomDate, setPrimaryCustomDate] = useState('');
  const [primaryNotes, setPrimaryNotes] = useState('');

  // Multiple reminders list
  const [additionalReminders, setAdditionalReminders] = useState<{ id: string; date: string; note: string; preset: string }[]>([]);

  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // List of existing unique clients from payments
  const existingClients = useMemo(() => {
    const set = new Set<string>();
    payments.forEach(p => {
      if (p.clientName?.trim()) set.add(p.clientName.trim());
    });
    return Array.from(set);
  }, [payments]);

  const calculateDateForPreset = (preset: string, custom?: string): string => {
    const d = new Date();
    if (preset === '1_day') d.setDate(d.getDate() + 1);
    else if (preset === '2_days') d.setDate(d.getDate() + 2);
    else if (preset === '7_days') d.setDate(d.getDate() + 7);
    else if (preset === '15_days') d.setDate(d.getDate() + 15);
    else if (preset === '30_days') d.setDate(d.getDate() + 30);
    else if (preset === 'custom' && custom) return custom;
    return d.toISOString().split('T')[0];
  };

  const processImageFile = (file: File) => {
    setIsProcessingImage(true);
    setError('');

    const reader = new FileReader();
    reader.onerror = () => {
      setError('Could not read image file.');
      setIsProcessingImage(false);
    };

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsProcessingImage(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setImageSrc(compressed);
        } else {
          setImageSrc(result);
        }
        setIsProcessingImage(false);
      };

      img.onerror = () => {
        setImageSrc(result);
        setIsProcessingImage(false);
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleAddSubReminder = () => {
    const nextDate = calculateDateForPreset('7_days');
    setAdditionalReminders(prev => [
      ...prev,
      {
        id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        date: nextDate,
        note: '',
        preset: '7_days'
      }
    ]);
  };

  const handleUpdateSubReminder = (id: string, updates: Partial<{ date: string; note: string; preset: string }>) => {
    setAdditionalReminders(prev => prev.map(r => {
      if (r.id !== id) return r;
      const merged = { ...r, ...updates };
      if (updates.preset && updates.preset !== 'custom') {
        merged.date = calculateDateForPreset(updates.preset);
      }
      return merged;
    }));
  };

  const handleRemoveSubReminder = (id: string) => {
    setAdditionalReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleClose = () => {
    setImageSrc(null);
    setTitle('');
    setClientName('');
    setIsNewClient(false);
    setAmount('');
    setSelectedPreset('1_day');
    setPrimaryCustomDate('');
    setPrimaryNotes('');
    setAdditionalReminders([]);
    setError('');
    onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) {
      setError('Please click or upload a photo of the receipt/cheque.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title/description for this receipt.');
      return;
    }

    const assignedClient = clientName.trim() || title.trim();

    setIsSaving(true);
    setError('');

    try {
      const primaryDate = calculateDateForPreset(selectedPreset, primaryCustomDate);

      // Build structured multiple reminders schedule
      const remindersScheduleList: ReminderScheduleItem[] = [
        {
          id: `sub-primary-${Date.now()}`,
          date: primaryDate,
          note: primaryNotes.trim() || 'Initial Follow-up Reminder',
          preset: selectedPreset,
          completed: false
        },
        ...additionalReminders.map(ar => ({
          id: ar.id,
          date: ar.date,
          note: ar.note.trim() || 'Follow-up Reminder',
          preset: ar.preset,
          completed: false
        }))
      ];

      await addPhotoReminder({
        title: title.trim(),
        clientName: assignedClient,
        amount: amount ? Number(amount) : undefined,
        imageUrl: imageSrc,
        reminderDate: primaryDate,
        preset: selectedPreset,
        notes: primaryNotes.trim() || undefined,
        status: 'Pending',
        remindersList: remindersScheduleList,
        createdBy: activePartner.name,
      });

      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save receipt reminder');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const targetDateDisplay = calculateDateForPreset(selectedPreset, primaryCustomDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Click Image of Receipt</h2>
              <p className="text-[10px] text-slate-400">Assign to client & set multiple reminders</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. PHOTO CAPTURE SECTION */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              1. Receipt / Cheque Photo *
            </label>

            {!imageSrc ? (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="py-5 px-3 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-slate-200 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 group"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-white">Take Photo</span>
                  <span className="text-[10px] text-amber-400/80 font-medium">Opens phone camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="py-5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/70 hover:bg-slate-800 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-200">From Gallery</span>
                  <span className="text-[10px] text-slate-500">Pick saved image</span>
                </button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={e => { if (e.target.files?.[0]) processImageFile(e.target.files[0]); e.target.value = ''; }}
                  className="hidden"
                />

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => { if (e.target.files?.[0]) processImageFile(e.target.files[0]); e.target.value = ''; }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video group">
                <img
                  src={imageSrc}
                  alt="Captured receipt"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            )}

            {isProcessingImage && (
              <p className="text-xs text-amber-400 text-center mt-2 animate-pulse">
                Optimizing image...
              </p>
            )}
          </div>

          {/* 2. CLIENT ASSIGNMENT & RECEIPT TITLE */}
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Assign to Client / Party *</span>
                </label>
                {existingClients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsNewClient(p => !p)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {isNewClient ? 'Pick existing client' : '+ Enter new client'}
                  </button>
                )}
              </div>

              {!isNewClient && existingClients.length > 0 ? (
                <select
                  value={clientName}
                  onChange={e => {
                    setClientName(e.target.value);
                    if (!title) setTitle(`${e.target.value} Receipt`);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="">-- Select Client from Records --</option>
                  {existingClients.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => {
                    setClientName(e.target.value);
                    if (!title) setTitle(`${e.target.value} Receipt`);
                  }}
                  placeholder="Enter client or party name (e.g. Ramesh Kumar)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500 font-medium"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Receipt Name / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Token Advance Cheque #4021"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Amount (₹) (Optional)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="250000"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. PRIMARY REMINDER SCHEDULE */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Primary Reminder:</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                Due: {new Date(targetDateDisplay).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: '1_day', label: '1 Day' },
                { id: '2_days', label: '2 Days' },
                { id: '7_days', label: '7 Days' },
                { id: '15_days', label: '15 Days' },
                { id: '30_days', label: '30 Days' },
                { id: 'custom', label: 'Custom' },
              ].map(preset => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.id as any)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {selectedPreset === 'custom' && (
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={primaryCustomDate}
                onChange={e => setPrimaryCustomDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-white"
              />
            )}

            <input
              type="text"
              value={primaryNotes}
              onChange={e => setPrimaryNotes(e.target.value)}
              placeholder="Note: e.g. Call client before depositing cheque"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 4. MULTIPLE FOLLOW-UP REMINDERS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">
                Additional Follow-up Reminders
              </label>
              <button
                type="button"
                onClick={handleAddSubReminder}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Follow-up</span>
              </button>
            </div>

            {additionalReminders.map((rem, idx) => (
              <div key={rem.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Follow-up #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubReminder(rem.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Preset</label>
                    <select
                      value={rem.preset}
                      onChange={e => handleUpdateSubReminder(rem.id, { preset: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                    >
                      <option value="1_day">+1 Day</option>
                      <option value="2_days">+2 Days</option>
                      <option value="7_days">+7 Days (1 Week)</option>
                      <option value="15_days">+15 Days (Half Month)</option>
                      <option value="30_days">+30 Days (1 Month)</option>
                      <option value="custom">Custom Date</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Reminder Date</label>
                    <input
                      type="date"
                      value={rem.date}
                      onChange={e => handleUpdateSubReminder(rem.id, { date: e.target.value, preset: 'custom' })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={rem.note}
                  onChange={e => handleUpdateSubReminder(rem.id, { note: e.target.value })}
                  placeholder="Note: e.g. Verify clearance with banker"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || isProcessingImage}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <span>Saving Receipt & Reminders...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Set Receipt & Reminders</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
