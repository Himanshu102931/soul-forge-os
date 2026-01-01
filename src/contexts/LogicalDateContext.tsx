import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getLogicalDateString } from '@/lib/time-utils';
import { useProfile } from '@/hooks/useProfile';

interface LogicalDateContextType {
  logicalDate: string;
  dayStartHour: number;
  refreshDate: () => void;
}

const LogicalDateContext = createContext<LogicalDateContextType | undefined>(undefined);

export function LogicalDateProvider({ children }: { children: React.ReactNode }) {
  const { data: profile } = useProfile();
  const dayStartHour = profile?.day_start_hour ?? 4;
  const [logicalDate, setLogicalDate] = useState(() => getLogicalDateString(new Date(), dayStartHour));
  const queryClient = useQueryClient();

  const refreshDate = useCallback(() => {
    const newDate = getLogicalDateString(new Date(), dayStartHour);
    if (newDate !== logicalDate) {
      setLogicalDate(newDate);
      // Invalidate all queries when date changes
      queryClient.invalidateQueries();
    }
  }, [logicalDate, queryClient, dayStartHour]);

  useEffect(() => {
    const handleFocus = () => {
      refreshDate();
    };

    window.addEventListener('focus', handleFocus);
    
    // Also check every minute
    const interval = setInterval(refreshDate, 60000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [refreshDate]);

  return (
    <LogicalDateContext.Provider value={{ logicalDate, dayStartHour, refreshDate }}>
      {children}
    </LogicalDateContext.Provider>
  );
}

export function useLogicalDate() {
  const context = useContext(LogicalDateContext);
  if (context === undefined) {
    throw new Error('useLogicalDate must be used within a LogicalDateProvider');
  }
  return context;
}
