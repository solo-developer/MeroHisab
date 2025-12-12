// App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import RegisterScreen from './src/screens/RegisterScreen';
import { getUser } from './src/storage/userStorage';
import MainContainer from './src/navigation/MainContainer';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getUser();
      setIsRegistered(!!user);
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) return null;

  if (!isRegistered) {
    return <RegisterScreen onRegistered={() => setIsRegistered(true)} />;
  }

  return <MainContainer />;
};

export default App;
