import { Stack } from "expo-router";
<<<<<<< Updated upstream
=======
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TransactionProvider } from '../contexts/TransactionContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Create a separate component for Stack configuration
function StackNavigator() {
  const { theme } = useTheme();
  
  return (
    <Stack>
      <Stack.Screen 
        name="splash" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="transactionForm" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Add Transaction',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text.primary,
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="currencySelect" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Select Currency',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text.primary,
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="policyModal" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Privacy Policy',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text.primary,
          headerShadowVisible: false,
        }} 
      />
<<<<<<< Updated upstream
=======
      <Stack.Screen name="index" options={{ title: 'Index' }} />
       <Stack.Screen name="home" options={{ title: 'Home' }} />
       <Stack.Screen name="entry" options={{ title: 'Entry' }} />
       <Stack.Screen name="testing" options={{ title: 'Test' }} />
       <Stack.Screen name="savings" options={{ title: 'Savings' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <TransactionProvider>
          <CurrencyProvider>
            <StackNavigator />
          </CurrencyProvider>
        </TransactionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

/*export default function RootLayout() {
  return (
    <Stack>
>>>>>>> Stashed changes
      <Stack.Screen name="index" options={{ title: 'Index' }} />
       <Stack.Screen name="home" options={{ title: 'Home' }} />
       <Stack.Screen name="entry" options={{ title: 'Entry' }} />
       <Stack.Screen name="testing" options={{ title: 'Test' }} />
       <Stack.Screen name="savings" options={{ title: 'Savings' }} />
    </Stack>
  );
}
>>>>>>> Stashed changes

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Index' }} />
       <Stack.Screen name="home" options={{ title: 'Home' }} />
       <Stack.Screen name="testing" options={{ title: 'Test' }} />
       <Stack.Screen name="uh" options={{ title: 'Uh' }} />
       <Stack.Screen name="savings" options={{ title: 'Savings' }} />
    </Stack>
  );
}
