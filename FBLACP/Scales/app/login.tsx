import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGoal } from '../contexts/GoalContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginSVG from '../assets/images/loginui/login.svg';
import GoogleSVG from '../assets/images/loginui/google.svg';
import FacebookSVG from '../assets/images/loginui/facebook.svg';
import TwitterSVG from '../assets/images/loginui/twitter.svg';

import { loginUser } from '../services/database'; // Import the loginUser function

const Login = ({ navigation }: any) => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setShowGoalModal } = useGoal();

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                Alert.alert('Error', 'Please fill in all fields.');
                return;
            }

            const user = await loginUser(email, password); // Call the loginUser function
            if (user) {
                Alert.alert('Success', `Welcome back, ${user.email}!`);
                console.log('User Data:', user);

                // Check if user has set a savings goal
                const savedGoal = await AsyncStorage.getItem('savings_goal');
                if (!savedGoal) {
                    // If no goal is set, show the goal modal
                    setShowGoalModal(true);
                }

                // Navigate to the home screen or dashboard
                router.push({
                    pathname: '/home', // Ensure this matches the file path for the Home screen
                    params: { userId: user.id },
                  });
            } else {
                Alert.alert('Error', 'Invalid email or password.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            Alert.alert('Error', 'Failed to log in. Please try again.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ paddingHorizontal: 25 }}>
                <View style={{ alignItems: 'center' }}>
                    <LoginSVG
                        height={300}
                        width={300}
                        style={{ transform: [{ rotate: '-5deg' }] }} />
                </View>
                <Text style={{ fontFamily: 'SpaceMono-Regular', fontSize: 28, fontWeight: '500', color: '#333', marginBottom: 30 }}>Login</Text>

                <View style={{ flexDirection: 'row', borderBottomColor: '#ccc', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 25 }}>
                    <MaterialIcons name='alternate-email' size={20} color="#666" style={{ marginRight: 5 }} />
                    <TextInput
                        placeholder='Email ID'
                        style={{ flex: 1, paddingVertical: 0 }}
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={{ flexDirection: 'row', borderBottomColor: '#ccc', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 25 }}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={{ marginRight: 5 }} />
                    <TextInput
                        placeholder='Password'
                        style={{ flex: 1, paddingVertical: 0 }}
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={{ color: '#AD$OAF', fontWeight: '700' }}>Forgot?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#AD40AF', padding: 20, borderRadius: 10, marginBottom: 30 }}>
                    <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 16, color: '#fff' }}>Login</Text>
                </TouchableOpacity>

                <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>Or, login with...</Text>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                    <TouchableOpacity onPress={() => { }} style={{ borderColor: '#ddd', borderWidth: 2, borderRadius: 10, paddingHorizontal: 30, paddingVertical: 10 }}>
                        <GoogleSVG height={24} width={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }} style={{ borderColor: '#ddd', borderWidth: 2, borderRadius: 10, paddingHorizontal: 30, paddingVertical: 10 }}>
                        <FacebookSVG height={24} width={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }} style={{ borderColor: '#ddd', borderWidth: 2, borderRadius: 10, paddingHorizontal: 30, paddingVertical: 10 }}>
                        <TwitterSVG height={24} width={24} />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                    <Text>New to the app?</Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                     <Text style={{ color: '#AD40AF', fontWeight: '700' }}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    )

}

export default Login;