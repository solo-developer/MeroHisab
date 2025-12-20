import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import MainContainer from './src/navigation/MainContainer';
import { initDatabase } from './src/repositories/Database';
import {
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native';
import { Text } from 'react-native-paper';

enableScreens();

const DbLoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Initializing database…</Text>
    </View>
  );
};

const App = () => {

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (e) {
        console.error(e);
      }
    };

    init();
  }, []);
  
   if (!dbReady) {
    return  <DbLoadingScreen />; // or splash/loading screen
  }


  return <MainContainer />;
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
});