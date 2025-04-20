import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import GoogleSVG from '../assets/images/loginui/google.svg';
import FacebookSVG from '../assets/images/loginui/facebook.svg';
import TwitterSVG from '../assets/images/loginui/twitter.svg';
import { signupUser } from '../services/database'; // Import the signupUser function

const Signup = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            if (!email || !password) {
                Alert.alert('Error', 'Please fill in all fields.');
                return;
            }

            const userId = await signupUser(email, password); // Call the signupUser function
            Alert.alert('Success', 'Account created successfully!');
            console.log('User ID:', userId);

            // Navigate to the login screen or home screen
            router.push('/login'); // Use router.push for navigation
        } catch (error: any) {
            if (error.message.includes('Email already exists')) {
                Alert.alert('Error', 'This email is already registered. Please use a different email.');
            } else {
                console.error('Error signing up:', error);
                Alert.alert('Error', 'Failed to create an account. Please try again.');
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ paddingHorizontal: 25 }}>
                <View style={{ alignItems: 'center' }}>
                    <Image 
                        source={require('../assets/Living_Fish.gif')} 
                        style={{ width: 300, height: 300 }} 
                    />
                </View>
                <Text style={{ fontFamily: 'SpaceMono-Regular', fontSize: 28, fontWeight: '500', color: '#333', marginBottom: 30 }}>Sign Up</Text>

                <View style={{ flexDirection: 'row', borderBottomColor: '#ccc', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 25 }}>
                    <MaterialIcons name='alternate-email' size={20} color="#666" style={{ marginRight: 5 }} />
                    <TextInput
                        placeholder='Enter your email address'
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
                </View>

                <TouchableOpacity onPress={handleSignup} style={{ backgroundColor: '#FF5F02', padding: 20, borderRadius: 10, marginBottom: 30 }}>
                    <Text style={{ textAlign: 'center', fontWeight: '700', fontSize: 16, color: '#fff' }}>Sign Up</Text>
                </TouchableOpacity>

                <Text style = {{textAlign: 'center', color: '#666', marginBottom: 30}}>Or, sign up with...</Text>

                <View style={{flexDirection: 'row', justifyContent:'space-between', marginBottom:30}}>
                    <TouchableOpacity onPress={() => {}} style={{borderColor: '#ddd', borderWidth:2, borderRadius:10, paddingHorizontal:30, paddingVertical:10}}>
                        <GoogleSVG height={24} width={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {}} style={{borderColor: '#ddd', borderWidth:2, borderRadius:10, paddingHorizontal:30, paddingVertical:10}}>
                        <FacebookSVG height={24} width={24}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {}} style={{borderColor: '#ddd', borderWidth:2, borderRadius:10, paddingHorizontal:30, paddingVertical:10}}>
                        <TwitterSVG height={24} width={24}/>
                    </TouchableOpacity>
                </View>

                <View style={{flexDirection: 'row', justifyContent:'space-between', marginBottom:30}}>
                    <Text>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={{color:'#FF5F02', fontWeight:'700'}}>Login</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default Signup;