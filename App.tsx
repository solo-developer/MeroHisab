const APP_COLOR = '#1E88E5';

import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import MainContainer from './src/navigation/MainContainer';
import { initDatabase } from './src/repositories/Database';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { Text, Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { SnackbarProvider } from './src/context/SnackbarContext';
import { PreferencesProvider } from './src/context/PreferencesContext';

enableScreens();

const DbLoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={APP_COLOR}
        barStyle="light-content"
      />
      <ActivityIndicator size="large" color="#fff" />
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
    return <DbLoadingScreen />; // or splash/loading screen
  }

  return (
    <PaperProvider>
      <SnackbarProvider>
        <PreferencesProvider>
          <StatusBar
            backgroundColor={APP_COLOR}
            barStyle="light-content"
          />
          <MainContainer />
          <Toast />
        </PreferencesProvider>
      </SnackbarProvider>
    </PaperProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLOR,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
});