import React, { useState, useEffect, useRef } from 'react';
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
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

const UserAccount = ({ navigation, handleLogout }) => {
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Verification
  const [verificationId, setVerificationId] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const recaptchaVerifier = useRef(null);

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
          setNumber(userData.number || '');
          setIsVerified(userData.isPhoneVerified || false); // Get phone verified status
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const saveChanges = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(
        docRef,
        { name, email, address, number, isPhoneVerified: isVerified },
        { merge: true }
      );
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your profile changes have been saved.');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'An error occurred while saving your profile.');
    }
  };

  const sendVerificationCode = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(number, recaptchaVerifier.current);
      setVerificationId(id);
      Alert.alert('Verification Code Sent', 'Please check your phone.');
    } catch (error) {
      console.error('Error sending code:', error);
      Alert.alert('Error', 'Failed to send verification code.');
    }
  };

  const confirmCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      setIsVerified(true);
      Alert.alert('Success', 'Phone number verified!');
    } catch (error) {
      console.error('Invalid code:', error);
      Alert.alert('Invalid Code', 'Please check the OTP and try again.');
    }
  };

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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
      />

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
        <View style={styles.field}>
          <Text style={styles.label}>Name:</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          ) : (
            <Text style={styles.text}>{name}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email:</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />
          ) : (
            <Text style={styles.text}>{email}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address:</Text>
          {isEditing ? (
            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          ) : (
            <Text style={styles.text}>{address}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={number}
              onChangeText={(text) => {
                setNumber(text);
                setIsVerified(false);
              }}
              keyboardType="phone-pad"
            />
            {isVerified ? (
              <Icon name="check-circle" size={24} color="green" style={{ marginLeft: 8 }} />
            ) : (
              isEditing && (
                <TouchableOpacity onPress={sendVerificationCode}>
                  <Text style={{ color: 'blue', marginLeft: 10 }}>Verify</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {!isVerified && verificationId && isEditing && (
          <View style={styles.field}>
            <Text style={styles.label}>Enter OTP:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={confirmCode}>
                <Text style={{ color: 'green', marginLeft: 10 }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <Button title="Save Changes" onPress={saveChanges} />
          ) : (
            <Button title="Edit Profile" onPress={toggleEdit} />
          )}
        </View>

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
