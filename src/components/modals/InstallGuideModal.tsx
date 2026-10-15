import React from 'react';
import { X, Smartphone, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../locales/i18nContext';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallClick?: () => void;
  canPromptDirectly?: boolean;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  onInstallClick,
  canPromptDirectly = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Smartphone className="w-5 h-5 stroke-[2.2]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ফোনে অ্যাপ ইনস্টল করার নিয়ম
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {canPromptDirectly && (
            <button
              onClick={() => {
                if (onInstallClick) onInstallClick();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>এক ক্লিকে এখনই ইনস্টল করুন</span>
            </button>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-600 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Google Chrome দিয়ে ৩টি সহজ ধাপ:
            </h4>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  ১
                </span>
                <p>
                  আপনার ফোনের ক্রোম ব্রাউজারের ওপরের ডানদিকের <strong>থ্রি-ডট (⋮) মেনু</strong>-তে চাপ দিন।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  ২
                </span>
                <p>
                  মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> (হোম স্ক্রিনে যোগ করুন) চাপুন।
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                  ৩
                </span>
                <p>
                  পপ-আপে <strong>"Install"</strong> নির্বাচন করুন। কয়েক সেকেন্ডের মধ্যে ফোনের হোম স্ক্রিনে অ্যাপ যুক্ত হয়ে যাবে।
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>ইনস্টল করার পর ইন্টারনেট সংযোগ ছাড়াই আজীবন ব্যবহার করতে পারবেন!</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};
