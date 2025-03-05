import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Index' }} />
      <Stack.Screen name="home" options={{ title: 'Home' }} />
      <Stack.Screen name="testing" options={{ title: 'Test' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
       
    </Stack>
  );
}
