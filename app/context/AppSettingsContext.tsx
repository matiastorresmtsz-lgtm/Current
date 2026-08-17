'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { getUserSettings, isSupabaseConfigured, upsertUserSettings } from '../lib/supabase';

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
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [country, setCountryState] = useState<CountryCode>(readStoredCountry);

  useEffect(() => {
    localStorage.setItem('current_user_country', country);

    if (!isSignedIn || !user?.id || !isSupabaseConfigured()) {
      return;
    }

    (async () => {
      try {
        const token = await getToken();
        void upsertUserSettings({
          user_id: user.id,
          country,
          updated_at: new Date().toISOString(),
        }, token ?? undefined);
      } catch (err) {
        // ignore token/getToken errors and skip upsert
      }
    })();
  }, [country, isSignedIn, user?.id]);

  useEffect(() => {
    if (!isSignedIn || !user?.id || !isSupabaseConfigured()) return;

    const loadSettings = async () => {
      try {
        const token = await getToken();
        const remoteSettings = await getUserSettings(user.id, token ?? undefined);
        if (!remoteSettings?.country) return;

        const validCountry = AVAILABLE_COUNTRIES.some((option) => option.code === remoteSettings.country)
          ? remoteSettings.country as CountryCode
          : 'US';

        setCountryState(validCountry);
        localStorage.setItem('current_user_country', validCountry);
      } catch (err) {
        // ignore token/getToken errors and skip loading
      }
    };

    void loadSettings();
  }, [isSignedIn, user?.id]);

  const setCountry = (value: CountryCode) => setCountryState(value);

  return (
    <AppSettingsContext.Provider value={{ country, setCountry }}>
      {children}
    </AppSettingsContext.Provider>
  );
};
