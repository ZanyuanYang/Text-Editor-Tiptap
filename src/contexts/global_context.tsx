import React, { createContext, useState } from 'react';

type GlobalContextProviderProps = {
  children: React.ReactNode;
};

type GlobalContextType = {
  alertOpen: boolean;
  setAlertOpen: (value: boolean) => void;
  error: string;
  setError: (value: string) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  alertOpen: false,
  setAlertOpen: () => {},
  error: '',
  setError: () => {},
});

function GlobalProvider({ children }: GlobalContextProviderProps) {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  return (
    <GlobalContext.Provider
      value={{
        alertOpen,
        setAlertOpen,
        error,
        setError,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export { GlobalProvider, GlobalContext };
