import React, { useState } from 'react';
import { 
    Alert, 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState<'error' | 'success'>('error');
    const colorScheme = useColorScheme();
    const router = useRouter();

    async function handleUpdatePassword() {
        setStatusMsg('');
        if (!password || !confirmPassword) {
            setStatusType('error');
            setStatusMsg('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setStatusType('error');
            setStatusMsg('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setStatusType('error');
            setStatusMsg('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        setLoading(false);

        if (error) {
            setStatusType('error');
            setStatusMsg(error.message);
        } else {
            setStatusType('success');
            setStatusMsg('Your password has been successfully updated.');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 2000);
        }
    }

    const tint = Colors[colorScheme ?? 'light'].tint;

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={[tint, '#2D4A85', '#64748B']}
                style={styles.background}
            />
            
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>RESET PASSWORD</Text>
                    <Text style={styles.subtitle}>Enter your new secure password below</Text>
                </View>

                <View style={styles.formContainer}>
                    <BlurView intensity={30} tint="light" style={styles.glassCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                secureTextEntry
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                secureTextEntry
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </View>

                        {statusMsg ? (
                            <Text style={[styles.statusText, statusType === 'success' && styles.successText]}>
                                {statusMsg}
                            </Text>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.mainButton, loading && styles.buttonDisabled]}
                            onPress={handleUpdatePassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={tint} />
                            ) : (
                                <Text style={styles.mainButtonText}>UPDATE PASSWORD</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.backButtonText}>BACK TO LOGIN</Text>
                        </TouchableOpacity>
                    </BlurView>
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
        bottom: 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 50,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    formContainer: {
        marginBottom: 30,
    },
    glassCard: {
        borderRadius: 30,
        padding: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mainButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    mainButtonText: {
        color: '#4F46E5',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    statusText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
    successText: {
        color: '#4ADE80',
    },
});
