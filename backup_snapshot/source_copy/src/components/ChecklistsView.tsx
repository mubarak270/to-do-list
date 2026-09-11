import React, { useState } from 'react';
import { Plus, Check, Trash2, MoreVertical, Sparkles, BookOpen, ShoppingBag, Film, Heart, ListPlus } from 'lucide-react';
import { Checklist, ChecklistItem } from '../types';
import { soundManager } from '../utils/audio';

interface ChecklistsViewProps {
  checklists: Checklist[];
  onUpdateChecklists: (updated: Checklist[]) => void;
}

const CHECKLIST_THEMES = [
  { name: 'Warm Cream', bg: 'bg-[#FFF8F0] dark:bg-amber-950/20', border: 'border-amber-200/80 dark:border-amber-800/40', badgeBg: 'bg-amber-400 text-white', icon: 'GraduationCap' },
  { name: 'Mint Leaf', bg: 'bg-[#F0FDF4] dark:bg-emerald-950/20', border: 'border-emerald-200/80 dark:border-emerald-800/40', badgeBg: 'bg-teal-500 text-white', icon: 'ShoppingCart' },
  { name: 'Soft Rose', bg: 'bg-[#FFF1F2] dark:bg-rose-950/20', border: 'border-rose-200/80 dark:border-rose-800/40', badgeBg: 'bg-rose-400 text-white', icon: 'Film' },
  { name: 'Lavender', bg: 'bg-[#FAF5FF] dark:bg-purple-950/20', border: 'border-purple-200/80 dark:border-purple-800/40', badgeBg: 'bg-purple-500 text-white', icon: 'Heart' }
];

export const ChecklistsView: React.FC<ChecklistsViewProps> = ({
  checklists,
  onUpdateChecklists
}) => {
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListCategory, setNewListCategory] = useState('Personal');
  const [activeAddingId, setActiveAddingId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');

  const handleToggleItem = (checklistId: string, itemId: string) => {
    const updated = checklists.map((cl) => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: cl.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it))
      };
    });
    onUpdateChecklists(updated);
    soundManager.playCompleteSound();
  };

  const handleAddItem = (checklistId: string) => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `cli-${Date.now()}`,
      text: newItemText.trim(),
      done: false
    };
    const updated = checklists.map((cl) => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: [...cl.items, newItem]
      };
    });
    onUpdateChecklists(updated);
    setNewItemText('');
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    const updated = checklists.map((cl) => {
      if (cl.id !== checklistId) return cl;
      return {
        ...cl,
        items: cl.items.filter((it) => it.id !== itemId)
      };
    });
    onUpdateChecklists(updated);
  };

  const handleDeleteChecklist = (checklistId: string) => {
    if (confirm('Delete this checklist?')) {
      onUpdateChecklists(checklists.filter((c) => c.id !== checklistId));
    }
  };

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const theme = CHECKLIST_THEMES[checklists.length % CHECKLIST_THEMES.length];
    const newCl: Checklist = {
      id: `cl-${Date.now()}`,
      title: newListTitle.trim(),
      category: newListCategory,
      icon: theme.icon,
      color: theme.bg,
      items: [],
      createdAt: new Date().toISOString()
    };
    onUpdateChecklists([newCl, ...checklists]);
    setNewListTitle('');
    setIsCreatingList(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 pb-20">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Unlimited Checklists
          </h2>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Flexible standalone lists for study, shopping, movies & goals
          </p>
        </div>
        <button
          id="create-new-checklist-btn"
          onClick={() => setIsCreatingList(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <ListPlus className="w-4 h-4" />
          <span>New List</span>
        </button>
      </div>

      {/* New Checklist Creator Form Modal / Drawer */}
      {isCreatingList && (
        <form onSubmit={handleCreateChecklist} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-blue-200 dark:border-blue-900 animate-in fade-in">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
            Create New Checklist
          </h3>
          <input
            id="checklist-name-input"
            type="text"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="List Title (e.g. Packing Essentials, Books to Read...)"
            className="w-full text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 outline-hidden focus:border-blue-500 mb-2 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <select
              value={newListCategory}
              onChange={(e) => setNewListCategory(e.target.value)}
              className="text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
              <option value="Shopping">Shopping</option>
              <option value="Wishlist">Wishlist</option>
              <option value="Work">Work</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingList(false)}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-bold bg-blue-600 text-white rounded-lg px-4 py-1.5 hover:bg-blue-700 shadow-xs"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Floating Pastel Checklist Cards */}
      <div className="space-y-4">
        {checklists.map((cl, idx) => {
          const theme = CHECKLIST_THEMES[idx % CHECKLIST_THEMES.length];
          const completedCount = cl.items.filter((i) => i.done).length;

          return (
            <div
              key={cl.id}
              className={`relative rounded-3xl p-4.5 shadow-sm border transition-all ${theme.bg} ${theme.border} overflow-hidden`}
            >
              {/* Cute Floating Category Badge at top right */}
              <div className={`absolute top-4 right-4 w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs ${theme.badgeBg}`}>
                {cl.category === 'Study' ? (
                  <BookOpen className="w-4 h-4" />
                ) : cl.category === 'Shopping' ? (
                  <ShoppingBag className="w-4 h-4" />
                ) : cl.category === 'Wishlist' ? (
                  <Film className="w-4 h-4" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
              </div>

              {/* Title Header */}
              <div className="pr-12">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {cl.title}
                </h3>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {completedCount} of {cl.items.length} completed
                </span>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 mt-3">
                {cl.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 group py-1"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleItem(cl.id, item.id)}
                      className="flex items-center gap-2.5 text-left flex-1"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                          item.done
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {item.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs ${
                          item.done
                            ? 'line-through text-slate-500 dark:text-slate-400 font-medium'
                            : 'text-slate-900 dark:text-slate-100 font-bold'
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(cl.id, item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add item to list form */}
              {activeAddingId === cl.id ? (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem(cl.id);
                      }
                    }}
                    placeholder="Add item..."
                    className="flex-1 text-xs font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem(cl.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAddingId(null)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 px-1"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveAddingId(cl.id)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add item
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(cl.id)}
                    className="text-slate-500 hover:text-red-500 p-1 transition-colors"
                    title="Delete checklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
