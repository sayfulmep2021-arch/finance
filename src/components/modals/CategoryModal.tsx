import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  Tag,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { db } from '../../db';
import { Category } from '../../types';
import { useTranslation } from '../../locales/i18nContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialType?: 'expense' | 'income';
  onCategoryCreated?: (newCat: Category) => void;
  onDataChanged?: () => void;
}

const COLOR_PALETTE = [
  '#EF4444', // Red / Rose
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

const DEFAULT_ICONS = [
  'shopping-cart',
  'utensils',
  'home',
  'heart-pulse',
  'coffee',
  'car',
  'book',
  'zap',
  'gift',
  'briefcase',
  'coins',
  'laptop',
  'smartphone',
  'tag',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialType = 'expense',
  onCategoryCreated,
  onDataChanged,
}) => {
  const { t, language } = useTranslation();

  const [activeType, setActiveType] = useState<'expense' | 'income'>(initialType);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [selectedIcon, setSelectedIcon] = useState('tag');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Sync initial type when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
      setIsFormOpen(false);
      setEditingCategory(null);
      setName('');
      setFeedback(null);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => {
    const matchesType = c.type === activeType;
    const catName = (c.name || '').toLowerCase();
    const catNameBn = (c.nameBn || '').toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = term === '' || catName.includes(term) || catNameBn.includes(term);
    return matchesType && matchesSearch;
  });

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    setName('');
    setSelectedColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    setSelectedIcon('tag');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.nameBn || cat.name);
    setSelectedColor(cat.color || COLOR_PALETTE[0]);
    setSelectedIcon(cat.icon || 'tag');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert(t('enterTitle'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCat: Category = {
          ...editingCategory,
          name: trimmedName,
          nameBn: trimmedName,
          color: selectedColor,
          icon: selectedIcon,
          bgLight: `${selectedColor}20`,
        };
        await db.categories.put(updatedCat);

        // Update name in existing transactions for this category
        await db.transactions
          .where('categoryId')
          .equals(editingCategory.id)
          .modify({
            categoryName: trimmedName,
            categoryNameBn: trimmedName,
          });

        setFeedback({ text: t('categoryUpdated') });
      } else {
        // Create new category
        const newCat: Category = {
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: trimmedName,
          nameBn: trimmedName,
          type: activeType,
          color: selectedColor,
          icon: selectedIcon,
          bgLight: `${selectedColor}20`,
        };
        await db.categories.add(newCat);
        setFeedback({ text: t('categoryCreated') });

        if (onCategoryCreated) {
          onCategoryCreated(newCat);
        }
      }

      handleCloseForm();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      alert(`ত্রুটি: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      // Check transactions using this category
      const txCount = await db.transactions.where('categoryId').equals(cat.id).count();

      let confirmMsg = t('deleteCategoryConfirm');
      if (txCount > 0) {
        confirmMsg = t('categoryInUseWarning', { count: txCount });
      }

      if (!confirm(confirmMsg)) return;

      // If transactions exist, safely reassign to other category
      if (txCount > 0) {
        await db.transactions
          .where('categoryId')
          .equals(cat.id)
          .modify({
            categoryId: 'cat_other',
            categoryName: 'Other',
            categoryNameBn: 'অন্যান্য',
          });
      }

      await db.categories.delete(cat.id);
      setFeedback({ text: t('categoryDeleted') });
      if (onDataChanged) onDataChanged();
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      alert(`মুছে ফেলতে সমস্যা: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              {t('manageCategories')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedback.isError
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveType('expense');
                setIsFormOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeType === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('expenseCategories')}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveType('income');
                setIsFormOpen(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeType === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('incomeCategories')}
            </button>
          </div>

          {/* Create or Edit Category Form */}
          {isFormOpen ? (
            <form
              onSubmit={handleSubmit}
              className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-700/40 border border-blue-100 dark:border-slate-600 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white">
                  {editingCategory ? t('editCategory') : t('addNewCategory')}
                </span>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  {t('cancel')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t('categoryName')} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('categoryNamePlaceholder')}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  {t('categoryColor')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedColor === c
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-sm'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="w-full py-2.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 border border-blue-200/80 dark:border-blue-900/50 transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('addNewCategory')}</span>
            </button>
          )}

          {/* Search Categories */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchCategories')}
              className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
            />
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>{t('categories')}</span>
              <span>{filteredCategories.length} {t('categoriesCount')}</span>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                <FolderOpen className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 font-medium">
                  {t('noCategoriesFound')}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                {filteredCategories.map((cat) => {
                  const displayName =
                    language === 'bn' ? cat.nameBn || cat.name : cat.name || cat.nameBn;

                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 shadow-xs hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {displayName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
