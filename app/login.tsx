import { supabase } from '@/utils/supabase';
import React, { useState } from 'react';
import { 
    Alert, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    Dimensions, 
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    async function handleAuth() {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);

        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Alert.alert('Login Failed', error.message);
            }
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                Alert.alert('Signup Failed', error.message);
            } else if (!data.session) {
                Alert.alert('Verification Required', 'Please check your email to confirm your account!');
                setMode('login');
            }
        }

        setLoading(false);
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#4F46E5', '#7C3AED', '#C026D3']}
                style={styles.background}
            />
            
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {mode === 'login' 
                            ? 'Manage your properties with ease' 
                            : 'Start your journey with us today'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <BlurView intensity={20} tint="light" style={styles.glassCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="name@example.com"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                secureTextEntry
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.mainButton, loading && styles.buttonDisabled]}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#4F46E5" />
                            ) : (
                                <Text style={styles.mainButtonText}>
                                    {mode === 'login' ? 'Sign In' : 'Get Started'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </BlurView>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {mode === 'login' 
                            ? "Don't have an account?" 
                            : "Already have an account?"}
                    </Text>
                    <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                        <Text style={styles.toggleText}>
                            {mode === 'login' ? ' Sign Up' : ' Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: height,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        textAlign: 'center',
    },
    formContainer: {
        marginBottom: 30,
    },
    glassCard: {
        borderRadius: 30,
        padding: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mainButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.8,
    },
    mainButtonText: {
        color: '#4F46E5',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '500',
    },
    toggleText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});