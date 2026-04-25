import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';

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
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      if (url.includes('access_token')) {
          const urlStr = url.replace('#', '?');
          const parsedUrl = new URL(urlStr);
          const accessToken = parsedUrl.searchParams.get('access_token');
          const refreshToken = parsedUrl.searchParams.get('refresh_token');
          const type = parsedUrl.searchParams.get('type');

          if (accessToken && refreshToken) {
              if (type === 'recovery') {
                  setIsRecovery(true);
              }
              supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
              }).then(() => {
                  if (type === 'recovery') {
                      setTimeout(() => router.replace('/reset-password'), 100);
                  }
              });
          }
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, [router]);

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
      if (!isRecovery) {
        router.replace('/(tabs)');
      }
    }
  }, [session, loading, segments, isRecovery]);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              name="reset-password" 
              options={{ 
                 headerShown: false,
                 animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="update-password" 
              options={{ 
                 headerShown: false,
                 animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: 'fade',
              }} 
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PropertyProvider>
    </GestureHandlerRootView>
  );
}
