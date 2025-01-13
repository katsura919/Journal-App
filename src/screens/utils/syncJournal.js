import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendJournals } from '../services/websocket';

export const getUnsyncedJournals = async () => {
  const journals = JSON.parse(await AsyncStorage.getItem('journals')) || [];
  return journals.filter(journal => !journal.isSynced);
};

export const syncJournals = async (userId) => {
  const unsyncedJournals = await getUnsyncedJournals();
  if (unsyncedJournals.length > 0) {
    sendJournals(unsyncedJournals);
  }
};
