import { createContext, useContext, useState, type ReactNode } from 'react';
import { PIN_KEY } from '../lib/storage';

interface PinLockContextValue {
  savedPin: string | null;
  isLocked: boolean;
  isSettingPin: boolean;
  setIsLocked: (v: boolean) => void;
  setIsSettingPin: (v: boolean) => void;
  savePin: (pin: string) => void;
  removePin: () => void;
  unlock: (pin: string) => boolean;
}

const PinLockContext = createContext<PinLockContextValue | null>(null);

function readPin(): string | null {
  try {
    return localStorage.getItem(PIN_KEY);
  } catch {
    return null;
  }
}

export function PinLockProvider({ children }: { children: ReactNode }) {
  const [savedPin, setSavedPin] = useState<string | null>(readPin);
  const [isLocked, setIsLocked] = useState<boolean>(() => !!readPin());
  const [isSettingPin, setIsSettingPin] = useState(false);

  const savePin = (pin: string) => {
    try { localStorage.setItem(PIN_KEY, pin); } catch {}
    setSavedPin(pin);
    setIsSettingPin(false);
  };

  const removePin = () => {
    try { localStorage.removeItem(PIN_KEY); } catch {}
    setSavedPin(null);
    setIsLocked(false);
  };

  const unlock = (pin: string) => {
    if (pin === savedPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  return (
    <PinLockContext.Provider value={{ savedPin, isLocked, isSettingPin, setIsLocked, setIsSettingPin, savePin, removePin, unlock }}>
      {children}
    </PinLockContext.Provider>
  );
}

export function usePinLock() {
  const ctx = useContext(PinLockContext);
  if (!ctx) throw new Error('usePinLock must be used inside PinLockProvider');
  return ctx;
}
