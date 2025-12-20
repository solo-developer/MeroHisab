import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import MainContainer from './src/navigation/MainContainer';
import { initDatabase } from './src/repositories/Database';
import {
  View
} from 'react-native';
import { Text } from 'react-native-paper';

enableScreens();
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
    return <Text>Loading...</Text>; // or splash/loading screen
  }


  return <MainContainer />;
};

export default App;
