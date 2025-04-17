import React, { useState } from 'react'
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import LoginSVG from '../assets/images/loginui/login.svg';
import GoogleSVG from '../assets/images/loginui/google.svg';
import FacebookSVG from '../assets/images/loginui/facebook.svg';
import TwitterSVG from '../assets/images/loginui/twitter.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const handleLogin = async () => {
        try {
            await signIn(email, password);
            router.replace('/(tabs)/home');
        } catch (error) {
            Alert.alert('Error', 'Invalid email or password');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <LoginSVG
                        height={300}
                        width={300}
                        style={{ transform: [{ rotate: '-5deg' }] }} />
                </View>
                <Text style={[styles.title, { color: theme.text.primary }]}>Login</Text>

                <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
                    <MaterialIcons name='alternate-email' size={20} color={theme.text.secondary} style={styles.inputIcon} />
                    <TextInput 
                        placeholder='Email ID' 
                        style={[styles.input, { color: theme.text.primary }]} 
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
                    <TextInput 
                        placeholder='Password' 
                        style={[styles.input, { color: theme.text.primary }]} 
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    onPress={handleLogin} 
                    style={[styles.loginButton, { backgroundColor: theme.primary }]}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <Text style={[styles.orText, { color: theme.text.secondary }]}>Or, login with...</Text>

                <View style={styles.socialButtons}>
                    <TouchableOpacity 
                        onPress={() => {}} 
                        style={[styles.socialButton, { borderColor: theme.border }]}
                    >
                        <GoogleSVG height={24} width={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => {}} 
                        style={[styles.socialButton, { borderColor: theme.border }]}
                    >
                        <FacebookSVG height={24} width={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => {}} 
                        style={[styles.socialButton, { borderColor: theme.border }]}
                    >
                        <TwitterSVG height={24} width={24}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.signupContainer}>
                    <Text style={{ color: theme.text.secondary }}>New to the app?</Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={[styles.signupText, { color: theme.primary }]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 25,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 28,
        fontWeight: '500',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
        alignItems: 'center',
    },
    inputIcon: {
        marginRight: 5,
    },
    input: {
        flex: 1,
        paddingVertical: 0,
    },
    forgotText: {
        fontWeight: '700',
    },
    loginButton: {
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
    },
    loginButtonText: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        color: '#fff',
    },
    orText: {
        textAlign: 'center',
        marginBottom: 30,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    socialButton: {
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    signupText: {
        fontWeight: '700',
    },
});

export default Login;