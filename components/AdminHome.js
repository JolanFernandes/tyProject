import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const AdminHome = ({ handleLogout }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Home Dashboard</Text>
      <Text style={styles.text}>Welcome to the admin panel. Here you can manage users and settings.</Text>
      <Button title="Logout" onPress={handleLogout} />
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default AdminHome;
