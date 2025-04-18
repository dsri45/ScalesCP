import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/signup" />;
}



/*import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>swimming in savings!</Text>
      <Link href="/entry" style={styles.button}>
        Go to entry screen
      </Link>
      <Link href="/login" style={styles.button}>
        Go to Login screen
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
}); */