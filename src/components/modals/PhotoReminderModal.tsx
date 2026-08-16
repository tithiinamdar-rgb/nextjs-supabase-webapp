'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePartnerStore } from '@/lib/store/partnerStore';
import { 
  Camera, 
  Upload, 
  X, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Sparkles, 
  Check, 
  RotateCcw,
  AlertCircle,
  FileImage
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

  // Helper to calculate preset target date
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

  // Start live webcam if user clicks "Open Camera"
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
      // Fallback to file input
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
      setError('Please snap or upload a photo of the document, check, or note.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Snap & Set Reminder</h2>
              <p className="text-[11px] text-slate-500">Capture document/cheque and set a reminder</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PHOTO CAPTURE / PREVIEW SECTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              1. Document / Cheque Photo
            </label>

            {!imageSrc && !isCameraActive && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="py-6 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/40 text-slate-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-700 group-hover:text-amber-600 transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Snap with Camera</span>
                  <span className="text-[10px] text-slate-400">Phone or Webcam</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-6 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-700 group-hover:text-slate-900 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Upload Image</span>
                  <span className="text-[10px] text-slate-400">Gallery or Files</span>
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

            {/* LIVE CAMERA VIEW */}
            {isCameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Click Picture</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* IMAGE PREVIEW */}
            {imageSrc && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video group">
                <img
                  src={imageSrc}
                  alt="Captured"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setImageSrc(null)}
                    className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 text-xs flex items-center gap-1 backdrop-blur-xs cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NAME & AMOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                2. Name / Description *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Ramesh Cheque / Token Slip"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount (₹) (Optional)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* PRESET REMINDER WHEN OPTIONS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                3. Reminder When:
              </label>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Due on: {new Date(targetDateDisplay).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {selectedPreset === 'custom' && (
              <div className="mt-2.5">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                />
              </div>
            )}
          </div>

          {/* NOTES (OPTIONAL) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Call before depositing in HDFC account"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70"
            >
              {isSaving ? (
                <span>Saving Reminder...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
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
