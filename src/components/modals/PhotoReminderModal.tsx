'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Camera, 
  Upload, 
  X, 
  IndianRupee, 
  Sparkles, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface PhotoReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhotoReminderModal({ isOpen, onClose }: PhotoReminderModalProps) {
  const { addPhotoReminder, activePartner } = usePartnerStore();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'1_day' | '2_days' | '7_days' | '15_days' | '30_days' | 'custom'>('1_day');
  const [customDate, setCustomDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const startCamera = async () => {
    setError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      if (fileInputRef.current) fileInputRef.current.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageSrc(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    setImageSrc(null);
    setTitle('');
    setAmount('');
    setSelectedPreset('1_day');
    setCustomDate('');
    setNotes('');
    setError('');
    onClose();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) {
      setError('Please snap or upload a photo of the cheque or document.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a name or title for this reminder.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const reminderDate = calculateDateForPreset(selectedPreset, customDate);

      await addPhotoReminder({
        title: title.trim(),
        amount: amount ? Number(amount) : undefined,
        imageUrl: imageSrc,
        reminderDate,
        preset: selectedPreset,
        notes: notes.trim() || undefined,
        status: 'Pending',
        createdBy: activePartner.name,
      });

      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save reminder');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const targetDateDisplay = calculateDateForPreset(selectedPreset, customDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Snap & Set Reminder</h2>
              <p className="text-[10px] text-slate-400">Photo document/cheque reminder</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Capture Section */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              1. Document / Cheque Photo
            </label>

            {!imageSrc && !isCameraActive && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={startCamera}
                  className="py-5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 bg-slate-900/70 hover:bg-slate-800 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-medium text-slate-200">Snap Photo</span>
                  <span className="text-[10px] text-slate-500">Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-600 bg-slate-900/70 hover:bg-slate-800 text-slate-300 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-200">Upload Image</span>
                  <span className="text-[10px] text-slate-500">From Files</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* LIVE CAMERA */}
            {isCameraActive && (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-2 px-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* IMAGE PREVIEW */}
            {imageSrc && (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video group">
                <img
                  src={imageSrc}
                  alt="Captured"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => setImageSrc(null)}
                    className="px-2 py-1 rounded bg-slate-900/90 text-slate-200 hover:text-white border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NAME & AMOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                2. Name / Description *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Ramesh Cheque"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount (₹) (Optional)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="250000"
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* PRESET OPTIONS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                3. Reminder When:
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
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {selectedPreset === 'custom' && (
              <div className="mt-2">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-white"
                />
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Set Photo Reminder</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
