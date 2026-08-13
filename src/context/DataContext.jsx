import React, { createContext, useContext, useMemo } from 'react';
import useGoogleSheetsDataInternal from '../hooks/useGoogleSheetsDataInternal';
import ConnectionError from '../components/shared/ConnectionError';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const data = useGoogleSheetsDataInternal();
  
  const contextValue = useMemo(() => data, [data]);
  
  if (data.connectionStatus === 'disconnected') {
    return <ConnectionError error={data.error} onRetry={data.refresh} />;
  }
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
