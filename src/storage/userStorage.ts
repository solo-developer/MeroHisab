import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'MER0_HISAB_USER';

export const saveUser = async (username: string, password: string) => {
  const data = JSON.stringify({ username, password });
  await AsyncStorage.setItem(USER_KEY, data);
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
