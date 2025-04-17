import React, { useState } from 'react'
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import SignUpSVG from '../assets/images/loginui/signup.svg';
import GoogleSVG from '../assets/images/loginui/google.svg';
import FacebookSVG from '../assets/images/loginui/facebook.svg';
import TwitterSVG from '../assets/images/loginui/twitter.svg';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signUp } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        try {
            await signUp(email, password);
            router.replace('/(tabs)/home');
        } catch (error) {
            Alert.alert('Error', 'Failed to create account');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <SignUpSVG
                        height={300}
                        width={300}
                        style={{ transform: [{ rotate: '-5deg' }] }} />
                </View>
                <Text style={[styles.title, { color: theme.text.primary }]}>Sign Up</Text>

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
                </View>

                <View style={[styles.inputContainer, { borderBottomColor: theme.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.text.secondary} style={styles.inputIcon} />
                    <TextInput 
                        placeholder='Confirm Password' 
                        style={[styles.input, { color: theme.text.primary }]} 
                        secureTextEntry={true}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleSignUp} 
                    style={[styles.signupButton, { backgroundColor: theme.primary }]}
                >
                    <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <Text style={[styles.orText, { color: theme.text.secondary }]}>Or, sign up with...</Text>

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

                <View style={styles.loginContainer}>
                    <Text style={{ color: theme.text.secondary }}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={[styles.loginText, { color: theme.primary }]}>Login</Text>
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
    signupButton: {
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
    },
    signupButtonText: {
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    loginText: {
        fontWeight: '700',
    },
});

export default SignUp;