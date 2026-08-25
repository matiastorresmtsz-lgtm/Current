'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { getUserSettings, isSupabaseConfigured, upsertUserSettings } from '../lib/supabase';

export type CountryCode = 'US' | 'CA' | 'MX' | 'GB' | 'DE' | 'FR' | 'JP' | 'BR' | 'AU' | 'IN';

export const AVAILABLE_COUNTRIES: { code: CountryCode; label: string }[] = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'BR', label: 'Brazil' },
  { code: 'AU', label: 'Australia' },
  { code: 'IN', label: 'India' },
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
