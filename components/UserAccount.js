import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UserAccount = ({
  navigation,
  handleLogout,
}) => {
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid; // Unique ID for the current user

  // State for user info and edit mode
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setAddress(userData.address || '');
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Save changes to Firestore
  const saveChanges = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { name, email, address }, { merge: true }); // Update fields
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your profile changes have been saved.');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'An error occurred while saving your profile.');
    }
  };

  // Logout functionality
  const handleSignOut = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: handleLogout,
        },
      ],
      { cancelable: false }
    );
  };

  // Toggle editing mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="search" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>User Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Name Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Name:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          ) : (
            <Text style={styles.text}>{name}</Text>
          )}
        </View>

        {/* Email Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Email:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          ) : (
            <Text style={styles.text}>{email}</Text>
          )}
        </View>

        {/* Address Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Address:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
            />
          ) : (
            <Text style={styles.text}>{address}</Text>
          )}
        </View>

        {/* Toggle Edit/Save */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <Button title="Save Changes" onPress={saveChanges} />
          ) : (
            <Button title="Edit Profile" onPress={toggleEdit} />
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.buttonContainer}>
          <Button title="Logout" color="red" onPress={handleSignOut} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: 'black',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default UserAccount;
