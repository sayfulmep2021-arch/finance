import React from 'react';
import { CreditCard, Smartphone, Plus } from 'lucide-react';
import { WalletAccount } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface AccountCardsGridProps {
  wallets: WalletAccount[];
  currencySymbol?: string;
  useBengaliDigits?: boolean;
  onSelectWallet: (wallet: WalletAccount) => void;
  onAddWallet: () => void;
}

export const AccountCardsGrid: React.FC<AccountCardsGridProps> = ({
  wallets,
  currencySymbol = '৳',
  useBengaliDigits = false,
  onSelectWallet,
  onAddWallet,
}) => {
  // Filter for secondary wallets like EBL and Bkash, or all non-main
  const secondaryWallets = wallets.filter((w) => w.id !== 'wallet_main');

  return (
    <div className="grid grid-cols-2 gap-3">
      {secondaryWallets.slice(0, 2).map((wallet) => {
        const isBkash = wallet.name.toLowerCase().includes('bkash');
        const isEbl = wallet.name.toLowerCase().includes('ebl') || wallet.bankName?.includes('Eastern');

        return (
          <button
            key={wallet.id}
            onClick={() => onSelectWallet(wallet)}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs hover:shadow-card hover:border-blue-200 dark:hover:border-slate-600 transition-all text-left focus:outline-none active:scale-[0.98]"
          >
            {/* Custom Icon / Brand Icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isBkash
                  ? 'bg-pink-50 dark:bg-pink-950/40 text-[#E2136E]'
                  : isEbl
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0066B2]'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isBkash ? (
                // bKash Bird Stylized Origami Icon
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12.5 3L4 14.5h8.5l-2.5 6.5L20 8.5h-8.5L12.5 3z" />
                </svg>
              ) : isEbl ? (
                // EBL Bank Card Icon
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Smartphone className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>

            {/* Label & Balance */}
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block truncate">
                {wallet.name}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5 tracking-tight truncate">
                {formatCurrency(wallet.balance, currencySymbol, useBengaliDigits)}
              </span>
            </div>
          </button>
        );
      })}

      {/* If fewer than 2 secondary wallets, provide an Add button */}
      {secondaryWallets.length < 2 && (
        <button
          onClick={onAddWallet}
          className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-500 hover:text-blue-600 text-xs font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ওয়ালেট যোগ করুন</span>
        </button>
      )}
    </div>
  );
};
