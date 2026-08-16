'use client';

import React, { useState, useRef } from 'react';
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
  Check
} from 'lucide-react';

interface PhotoReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhotoReminderModal({ isOpen, onClose }: PhotoReminderModalProps) {
  const { addPhotoReminder, activePartner } = usePartnerStore();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'1_day' | '2_days' | '7_days' | '15_days' | '30_days' | 'custom'>('1_day');
  const [customDate, setCustomDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

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

  // Compress & resize image for fast mobile performance
  const processImageFile = (file: File) => {
    setIsProcessingImage(true);
    setError('');

    const reader = new FileReader();
    reader.onerror = () => {
      setError('Could not read image file. Please try again.');
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

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so user can take another if needed
    e.target.value = '';
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handleClose = () => {
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
      setError('Please click a photo of the receipt or cheque.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a name/party for this receipt.');
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
      setError(err.message || 'Failed to save receipt reminder');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const targetDateDisplay = calculateDateForPreset(selectedPreset, customDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Click Image of Receipt</h2>
              <p className="text-[10px] text-slate-400">Photo document/receipt reminder</p>
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
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. PHOTO CAPTURE (100% RELIABLE FOR MOBILE & DESKTOP) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              1. Receipt / Cheque Photo *
            </label>

            {!imageSrc ? (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Take Photo button (native mobile camera) */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="py-6 px-3 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-slate-200 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-white">Take Photo</span>
                  <span className="text-[10px] text-amber-400/80 font-medium">Opens phone camera</span>
                </button>

                {/* Upload from Gallery button */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="py-6 px-3 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/70 hover:bg-slate-800 text-slate-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-200">From Gallery</span>
                  <span className="text-[10px] text-slate-500">Pick saved image</span>
                </button>

                {/* Hidden native input for mobile rear camera */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />

                {/* Hidden native input for gallery/photo library */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
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
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
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

          {/* 2. NAME & AMOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                2. Name / Description *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Ramesh Cheque / Token Slip"
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

          {/* 3. PRESET REMINDER OPTIONS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">
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
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
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

          {/* 4. NOTES */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Call before clearing from bank"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSaving || isProcessingImage}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <span>Saving Receipt...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Set Receipt Reminder</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
