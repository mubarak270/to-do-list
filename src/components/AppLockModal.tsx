import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, Check, ShieldCheck, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AppLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
  correctPin: string;
  isSetupMode?: boolean;
  onSaveNewPin?: (pin: string, biometricEnabled: boolean) => void;
  onCloseSetup?: () => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isLocked,
  onUnlock,
  correctPin,
  isSetupMode = false,
  onSaveNewPin,
  onCloseSetup
}) => {
  if (!isLocked && !isSetupMode) return null;

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [biometricToggled, setBiometricToggled] = useState(false);

  const handleDigitPress = (digit: string) => {
    soundManager.playTone(500 + Number(digit) * 40, 0.05);
    if (enteredPin.length >= 4) return;
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setErrorMsg('');

    if (newPin.length === 4) {
      if (isSetupMode) {
        // Handled via confirm button
      } else {
        if (newPin === correctPin) {
          soundManager.playCompleteSound();
          onUnlock();
          setEnteredPin('');
        } else {
          soundManager.playTone(220, 0.25);
          setErrorMsg('Incorrect PIN. Try again.');
          setTimeout(() => setEnteredPin(''), 600);
        }
      }
    }
  };

  const handleDelete = () => {
    soundManager.playTone(350, 0.05);
    setEnteredPin(enteredPin.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricAuth = () => {
    soundManager.playCompleteSound();
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-xs text-center flex flex-col items-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4 shadow-lg border border-blue-500/30">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          {isSetupMode ? 'Set 4-Digit App Lock' : 'App Locked'}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          {isSetupMode ? 'Enter a 4-digit PIN code' : 'Enter your PIN code to access tasks'}
        </p>

        {/* PIN Indicators (4 dots) */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < enteredPin.length;
            return (
              <span
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-blue-500 scale-110 shadow-md shadow-blue-500/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-red-400 mb-4 animate-shake">
            {errorMsg}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`pin-btn-${digit}`}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xl font-bold flex items-center justify-center border border-slate-700/60 active:scale-90 transition-all"
            >
              {digit}
            </button>
          ))}

          {/* Biometric fingerprint button */}
          {!isSetupMode ? (
            <button
              type="button"
              onClick={handleBiometricAuth}
              className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 text-blue-400 flex items-center justify-center border border-slate-700/60 active:scale-90 transition-all"
              title="Unlock with Biometrics"
            >
              <Fingerprint className="w-7 h-7" />
            </button>
          ) : (
            <div />
          )}

          {/* 0 digit */}
          <button
            id="pin-btn-0"
            type="button"
            onClick={() => handleDigitPress('0')}
            className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white text-xl font-bold flex items-center justify-center border border-slate-700/60 active:scale-90 transition-all"
          >
            0
          </button>

          {/* Delete button */}
          <button
            id="pin-btn-del"
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 active:scale-90 transition-all"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Setup mode actions */}
        {isSetupMode && (
          <div className="w-full flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onCloseSetup}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={enteredPin.length !== 4}
              onClick={() => {
                if (onSaveNewPin && enteredPin.length === 4) {
                  onSaveNewPin(enteredPin, biometricToggled);
                }
              }}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Save PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
