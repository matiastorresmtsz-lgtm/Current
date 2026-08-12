'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CountryCode = 'US' | 'CA' | 'MX' | 'GB' | 'DE' | 'FR' | 'JP' | 'BR' | 'AU' | 'IN';

export const AVAILABLE_COUNTRIES: { code: CountryCode; label: string; emoji: string }[] = [
  { code: 'US', label: 'United States', emoji: '🇺🇸' },
  { code: 'CA', label: 'Canada', emoji: '🇨🇦' },
  { code: 'MX', label: 'Mexico', emoji: '🇲🇽' },
  { code: 'GB', label: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'DE', label: 'Germany', emoji: '🇩🇪' },
  { code: 'FR', label: 'France', emoji: '🇫🇷' },
  { code: 'JP', label: 'Japan', emoji: '🇯🇵' },
  { code: 'BR', label: 'Brazil', emoji: '🇧🇷' },
  { code: 'AU', label: 'Australia', emoji: '🇦🇺' },
  { code: 'IN', label: 'India', emoji: '🇮🇳' },
];

interface AppSettingsContextValue {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue>({
  country: 'US',
  setCountry: () => {},
});

export const useAppSettings = () => useContext(AppSettingsContext);

function readStoredCountry(): CountryCode {
  if (typeof window === 'undefined') return 'US';
  const saved = (localStorage.getItem('current_user_country') as CountryCode | null)
    || (localStorage.getItem('stream_user_country') as CountryCode | null);
  return saved && AVAILABLE_COUNTRIES.some((c) => c.code === saved) ? saved : 'US';
}

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<CountryCode>(readStoredCountry);

  useEffect(() => {
    localStorage.setItem('current_user_country', country);
  }, [country]);

  const setCountry = (value: CountryCode) => setCountryState(value);

  return (
    <AppSettingsContext.Provider value={{ country, setCountry }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
