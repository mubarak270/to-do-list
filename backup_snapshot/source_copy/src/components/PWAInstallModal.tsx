import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, X, ExternalLink, ShieldCheck, WifiOff, Share2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        {/* Header close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center overflow-hidden">
            <img src="/pwa-192x192.png" alt="App Icon" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              অ্যাপ ইনস্টল করুন (Install App)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Android APK / Standalone Mobile App
            </p>
          </div>
        </div>

        {installSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              সফলভাবে ইনস্টল হচ্ছে!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              অ্যাপটি আপনার হোম স্ক্রিনে যুক্ত করা হয়েছে।
            </p>
          </div>
        ) : isInstalled ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              আপনি সরাসরি ফোনের অ্যাপ আইকন থেকে এটি ফুলস্ক্রিনে ব্যবহার করতে পারেন।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Features badge */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">ফুলস্ক্রিন অ্যাপ মোড</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">১০০% অফলাইন কাজ করে</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">পিন ও বায়োমেট্রিক লক</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">ড্রাইভ ব্যাকআপ সিঙ্ক</span>
              </div>
            </div>

            {/* Direct install button if prompt is available */}
            {isInstallable ? (
              <button
                id="pwa-one-click-install-btn"
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>ফোনে সরাসরি ইনস্টল করুন (Install Now)</span>
              </button>
            ) : null}

            {/* Step-by-step instructions for Android & iOS */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span>অ্যান্ড্রয়েড ফোনে যেভাবে অ্যাপের মত যুক্ত করবেন:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-400 pl-1">
                <li>
                  ক্রোম (Chrome) ব্রাউজারের উপরে ডানদিকের <strong className="text-slate-800 dark:text-slate-200">তিনটি ডট (⋮)</strong> মেনুতে চাপুন।
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">"Install app"</strong> অথবা <strong className="text-slate-800 dark:text-slate-200">"Add to Home screen"</strong> অপশনটিতে চাপুন।
                </li>
                <li>
                  তাহলে এটি যেকোনো APK এর মতোই আপনার ফোনে অ্যাপ আইকন হিসেবে যুক্ত হবে এবং ফুলস্ক্রিন চলবে।
                </li>
              </ol>

              {isIOS && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    iOS / iPhone ব্যবহারকারীদের জন্য:
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    সাফারি ব্রাউজারের নিচে <strong>Share (শেয়ার)</strong> বাটনে চাপ দিয়ে <strong>"Add to Home Screen"</strong> বেছে নিন।
                  </p>
                </div>
              )}
            </div>

            {/* Standalone APK note */}
            <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
              💡 <strong>টিপস:</strong> এই প্রোগ্রেসিভ ওয়েব অ্যাপ (PWA) টি ব্যাকগ্রাউন্ড সিঙ্কিং, নোটিফিকেশন ও অফলাইন মোড সমর্থন করে। Google Play Store বা সাধারণ APK ফাইল বানাতে এটি <strong>PWABuilder.com</strong> বা <strong>Bubblewrap</strong> দিয়ে যেকোনো সময় সরাসরি APK জেনারেট করা যায়।
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
