import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileSpreadsheet, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { exportFullBackup, exportTransactionsCsv, importBackup, resetAllData } from '../../utils/exportImport';
import { Transaction } from '../../types';
import { useTranslation } from '../../locales/i18nContext';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onDataChanged: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onDataChanged,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const handleExportJson = async () => {
    try {
      await exportFullBackup();
      setStatusMessage({ text: 'সফলভাবে সম্পূর্ণ ব্যাকআপ ফাইল (JSON) ডাউনলোড হয়েছে!', isError: false });
    } catch (err: any) {
      setStatusMessage({ text: `ব্যাকআপ ত্রুটি: ${err.message}`, isError: true });
    }
  };

  const handleExportCsv = () => {
    try {
      exportTransactionsCsv(transactions);
      setStatusMessage({ text: 'সফলভাবে লেনদেন CSV ফাইল এক্সপোর্ট হয়েছে!', isError: false });
    } catch (err: any) {
      setStatusMessage({ text: `CSV ত্রুটি: ${err.message}`, isError: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (!confirm('আপনি কি এই ব্যাকআপ ফাইলটি রিস্টোর করতে চান? আপনার পূর্বের ডেটা প্রতিস্থাপিত হবে।')) {
        return;
      }

      const res = await importBackup(content, 'replace');
      if (res.success) {
        setStatusMessage({ text: res.message, isError: false });
        onDataChanged();
      } else {
        setStatusMessage({ text: res.message, isError: true });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = async () => {
    try {
      await resetAllData();
      setIsResetConfirmOpen(false);
      setStatusMessage({ text: 'সকল ডেটা মুছে ফেলা হয়েছে। অ্যাপটি নতুনভাবে প্রস্তুত।', isError: false });
      onDataChanged();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ text: `রিসেট ত্রুটি: ${err.message}`, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t('backupAndRestore')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            আপনার সকল আর্থিক হিসাব আপনার নিজস্ব ডিভাইসে IndexedDB-তে সুরক্ষিত। ফোন পরিবর্তন বা ব্রাউজার পরিষ্কার করার আগে ব্যাকআপ ডাউনলোড করে রাখা নিরাপদ।
          </p>

          {/* Backup Action Cards */}
          <div className="space-y-2.5">
            {/* Export JSON */}
            <button
              onClick={handleExportJson}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-bold text-xs transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800 dark:text-white">
                  সম্পূর্ণ ব্যাকআপ ডাউনলোড (JSON)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  সকল ওয়ালেট, হিসাব, ঋণ ও বাজেট সংরক্ষণ করুন
                </span>
              </div>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-bold text-xs transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800 dark:text-white">
                  এক্সেল ফাইল এক্সপোর্ট (CSV)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Excel বা Google Sheets-এ লেনদেন দেখুন
                </span>
              </div>
            </button>

            {/* Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 font-bold text-xs transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800 dark:text-white">
                  ব্যাকআপ ফাইল আপলোড (Restore)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  পূর্বের সেভ করা JSON ফাইল থেকে ফিরিয়ে আনুন
                </span>
              </div>
            </button>
          </div>

          {/* Reset / Erase Area */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            {isResetConfirmOpen ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>আপনি কি নিশ্চিত যে সকল ডেটা মুছে ফেলতে চান?</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    হ্যাঁ, মুছে ফেলুন
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                {t('resetData')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
