import React from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';

const Login = ({
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  handleAuthentication,
  navigation, // Add this prop to navigate to the Sign-Up page
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Role (user  admin  delivery)"
        value={role}
        onChangeText={setRole}
      />
      <Button title="Sign In" onPress={handleAuthentication} />
      <TouchableOpacity onPress={() =>navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  signupText: {
    marginTop: 16,
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default Login;
