import { useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { usePinLock } from './PinLockProvider';

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-sm text-center space-y-5">{children}</div>
    </div>
  );
}

const inputCls =
  'w-full text-center tracking-[0.6em] text-2xl bg-white/5 border border-white/10 rounded-2xl py-3 text-white outline-none focus:border-copper';

function UnlockScreen() {
  const { unlock } = usePinLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const onChange = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    setPin(clean);
    setError(false);
    if (clean.length === 4 && !unlock(clean)) {
      setError(true);
      setPin('');
    }
  };

  return (
    <Shell>
      <Lock className="mx-auto text-copper" size={36} />
      <h1 className="text-2xl font-serif text-white">Diary locked</h1>
      <input autoFocus type="password" inputMode="numeric" value={pin} onChange={(e) => onChange(e.target.value)} placeholder="••••" className={inputCls} />
      {error && <p className="text-red-400 text-sm">Wrong PIN, try again.</p>}
    </Shell>
  );
}

function SetPinScreen() {
  const { savePin, setIsSettingPin } = usePinLock();
  const [first, setFirst] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const onChange = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 4);
    setPin(clean);
    setError('');
    if (clean.length !== 4) return;
    if (!first) {
      setFirst(clean);
      setPin('');
    } else if (clean === first) {
      savePin(clean);
    } else {
      setError('PINs did not match. Start again.');
      setFirst('');
      setPin('');
    }
  };

  return (
    <Shell>
      <Lock className="mx-auto text-copper" size={36} />
      <h1 className="text-2xl font-serif text-white">{first ? 'Confirm PIN' : 'Set a 4-digit PIN'}</h1>
      <input autoFocus type="password" inputMode="numeric" value={pin} onChange={(e) => onChange(e.target.value)} placeholder="••••" className={inputCls} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button onClick={() => setIsSettingPin(false)} className="text-stone-500 text-sm hover:text-stone-300">Cancel</button>
    </Shell>
  );
}

export default function PinLock({ children }: { children: ReactNode }) {
  const { isLocked, savedPin, isSettingPin } = usePinLock();
  if (isSettingPin) return <SetPinScreen />;
  if (isLocked && savedPin) return <UnlockScreen />;
  return <>{children}</>;
}
