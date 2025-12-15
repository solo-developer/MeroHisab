import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import MainContainer from './src/navigation/MainContainer';
import { initDatabase } from './src/repositories/Database';

enableScreens();
const App = () => {

  useEffect(() => {
    
      initDatabase();
  }, []);
  
  return <MainContainer />;
};

export default App;
