import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Index' }} />
       <Stack.Screen name="home" options={{ title: 'Home' }} />
       <Stack.Screen name="entry" options={{ title: 'Entry' }} />
       <Stack.Screen name="testing" options={{ title: 'Test' }} />
       <Stack.Screen name="savings" options={{ title: 'Savings' }} />
    </Stack>
  );
}
