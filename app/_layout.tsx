import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';
import { PropertyProvider } from '@/context/PropertyContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!session && inAuthGroup) {
      router.replace('/login');
    } else if (session && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) return null;

  return (
    <PropertyProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal', 
              title: 'Modal', 
              headerShown: true 
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PropertyProvider>
  );
}
