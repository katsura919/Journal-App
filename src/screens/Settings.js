import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Settings = ({ navigation }) => {
 

  return (
    <View style={styles.container}>
        <Text style={styles.header}>Settings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

});

export default Settings;
