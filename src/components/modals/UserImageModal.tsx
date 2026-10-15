import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Camera, ShieldCheck, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '../../locales/i18nContext';
import { saveUserImage, deleteUserImage } from '../../db';

interface UserImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentAvatarUrl?: string;
  onImageChanged: () => void;
}

export const UserImageModal: React.FC<UserImageModalProps> = ({
  isOpen,
  onClose,
  userName,
  currentAvatarUrl,
  onImageChanged,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle image selection and client-side compression/resizing
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 600x600 keeping aspect ratio
        const maxDim = 600;
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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedPreview(compressedDataUrl);
          setFileName(file.name);
          setFileSize(Math.round(compressedDataUrl.length * 0.75));
          setIsProcessing(false);
        } else {
          setSelectedPreview(event.target?.result as string);
          setFileName(file.name);
          setFileSize(file.size);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMessage('ছবি লোড করতে সমস্যা হয়েছে');
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedPreview) return;
    try {
      setIsProcessing(true);
      await saveUserImage(selectedPreview, fileName || 'avatar.jpg', fileSize);
      setSuccessMessage(t('photoUpdatedSuccess'));
      onImageChanged();
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedPreview(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(`ছবি সংরক্ষণে ত্রুটি: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('deletePhotoConfirm'))) return;
    try {
      setIsProcessing(true);
      await deleteUserImage();
      setSelectedPreview(null);
      setSuccessMessage(t('photoDeletedSuccess'));
      onImageChanged();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMessage(`ছবি মুছতে ত্রুটি: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayedImage = selectedPreview || currentAvatarUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn border border-slate-100 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('userProfilePhoto')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-center">
          {/* Notifications / Alerts */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* Profile Avatar Showcase */}
          <div className="relative inline-block mx-auto">
            <div className="w-32 h-32 rounded-full ring-4 ring-blue-500/20 dark:ring-blue-400/20 p-1 bg-white dark:bg-slate-700 shadow-xl overflow-hidden">
              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt={userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                  <Camera className="w-10 h-10 stroke-[1.75]" />
                  <span className="text-[10px] font-bold mt-1 text-slate-500 dark:text-slate-400">ছবি নেই</span>
                </div>
              )}
            </div>

            {/* Quick Upload Button Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center justify-center focus:outline-none active:scale-95 transition-all"
              title={t('uploadPhoto')}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Subtitle Branding */}
          <div>
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {userName || 'Sayful'}
            </h4>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold tracking-wide">
              {t('smartWalletSystem')}
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {selectedPreview ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
                <button
                  onClick={() => setSelectedPreview(null)}
                  disabled={isProcessing}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>{currentAvatarUrl ? t('changePhoto') : t('uploadPhoto')}</span>
                </button>

                {currentAvatarUrl && (
                  <button
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center transition-colors"
                    title={t('deletePhoto')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Permanent Logo Guarantee Notice */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-left">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug font-medium">
                {t('photoNoticePermanentLogo')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
