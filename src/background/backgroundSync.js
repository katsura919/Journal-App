import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncToServer } from './syncToServer';  // Assuming your sync functions are implemented
import { syncFromServer } from './syncFromServer'; 


export const syncIfOnline = async () => {
  try {
    // Check the network connection
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      console.log("Device is online, starting sync...");
      
      // Fetch userId from AsyncStorage (assuming user is logged in)
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log("User ID not found.");
        return;
      }

      // Perform the sync operations
      await syncToServer(userId); // Sync local changes to the server
      await syncFromServer(userId); // Sync server changes to the local database
    } else {
      console.log("Device is offline, waiting for network...");
    }
  } catch (error) {
    console.error("Error while syncing:", error);
  }
};
