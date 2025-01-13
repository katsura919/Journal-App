import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, AsyncStorage } from 'react-native';

const Profile = ({ navigation }) => {


  return (
    <View style={styles.container}>
        <Text style={styles.text}>Profile Screen</Text>
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
  text: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default Profile;
