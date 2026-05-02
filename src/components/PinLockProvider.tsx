export function PinLockProvider({ children }: any) {
  return <>{children}</>;
}

export function usePinLock() {
  return {
    savedPin: null,
    setIsSettingPin: () => {},
    setIsLocked: () => {}
  };
}
