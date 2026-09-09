import React, { useState } from 'react';
import { X, Cake, Calendar, Gift, Rocket, Heart } from 'lucide-react';
import { BirthdayCountdown } from '../types';

interface AddCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCountdown: (countdown: BirthdayCountdown) => void;
}

export const AddCountdownModal: React.FC<AddCountdownModalProps> = ({
  isOpen,
  onClose,
  onAddCountdown
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'birthday' | 'event' | 'holiday'>('birthday');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddCountdown({
      id: `cd-${Date.now()}`,
      title: title.trim(),
      date,
      type,
      icon: type === 'birthday' ? 'Cake' : type === 'holiday' ? 'Gift' : 'Rocket',
      color: type === 'birthday' ? '#EC4899' : '#3B82F6'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add Important Date
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mom's 60th Birthday"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-hidden"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-hidden font-medium"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'birthday', label: 'Birthday', icon: '🎂' },
                { id: 'event', label: 'Event', icon: '🚀' },
                { id: 'holiday', label: 'Anniversary', icon: '❤️' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                    type === t.id
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-600 dark:text-rose-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-500 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600"
            >
              Save Countdown
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
