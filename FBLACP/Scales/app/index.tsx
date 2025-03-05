<<<<<<< Updated upstream
import { Text, View, StyleSheet } from 'react-native';
=======
import { Redirect } from 'expo-router';

console.log("Testing redirect");
export default function Index() {
  return <Redirect href="/splash" />;
}



/*import { Text, View, StyleSheet } from 'react-native';
>>>>>>> Stashed changes
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
      <Link href="/home" style={styles.button}>
        Go to Home screen
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
});