// App.tsx
import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import RegisterScreen from './src/screens/RegisterScreen';
import { getUser } from './src/storage/userStorage';
import MainContainer from './src/navigation/MainContainer';
import { initDatabase } from './src/repositories/Database';

enableScreens();
const App = () => {
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    
      initDatabase();
  }, []);

  if (loading) return null;

  
  return <MainContainer />;
};

export default App;
