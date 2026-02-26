import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeaderSlotState {
  left: ReactNode | null;
  right: ReactNode | null;
}

interface HeaderSlotContextValue extends HeaderSlotState {
  setHeaderSlot: (slot: Partial<HeaderSlotState>) => void;
  clearHeaderSlot: () => void;
}

const HeaderSlotContext = createContext<HeaderSlotContextValue>({
  left: null,
  right: null,
  setHeaderSlot: () => {},
  clearHeaderSlot: () => {},
});

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HeaderSlotState>({ left: null, right: null });

  return (
    <HeaderSlotContext.Provider
      value={{
        ...slot,
        setHeaderSlot: (partial) => setSlot((prev) => ({ ...prev, ...partial })),
        clearHeaderSlot: () => setSlot({ left: null, right: null }),
      }}
    >
      {children}
    </HeaderSlotContext.Provider>
  );
}

export const useHeaderSlot = () => useContext(HeaderSlotContext);
