import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';  // ✅ useRouter, not router
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  withSpring, 
  useAnimatedStyle, 
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

console.log("Rendering SplashScreen");

export default function SplashScreen() {
  const { theme } = useTheme();
  const router = useRouter();  // ✅ You need this inside the component

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 1000 });
    
    console.log('Navigating after 2 seconds');
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');  // ✅ This works now!
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);  // ✅ Include `router` in the dependency array

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.logoContainer}>
          <Ionicons name="wallet" size={100} color="#fff" />
        </View>
        <Text style={styles.title}>BudgetN</Text>
        <Text style={styles.subtitle}>Smart Money Management</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
});
