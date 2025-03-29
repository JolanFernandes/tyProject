import * as React from 'react';
import { Alert, ActivityIndicator, Platform, View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import Login from './components/Login';
import AdminHome from './components/AdminHome';
import UserHome from './components/UserHome';
import DeliveryHome from './components/DeliveryHome';
import UserMenu from './components/UserMenu';
import ProductList from './components/UserProductList';
import Product from './components/UserProduct';
import Wishlist from './components/UserWishlist';
import Cart from './components/UserCart';
import UserAccount from './components/UserAccount';
import TrackingMap from './components/Tracking';
import ReminderApp from './components/ReminderScreen';
import { CartProvider } from './components/CartContext';
import GardeningServices from './components/Services';
import DeliveryTrackingMap from './components/DeliveryMap';

const firebaseConfig = {
  apiKey: "AIzaSyABrXGrEqwadHdYJ9teck5JnoKdUPQu2Ao",
  authDomain: "plantopia-2d73f.firebaseapp.com",
  projectId: "plantopia-2d73f",
  storageBucket: "plantopia-2d73f.appspot.com",
  messagingSenderId: "978812101597",
  appId: "1:978812101597:web:7c6182d569f09345e40c34",
  measurementId: "G-QFTY03ZLDL",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

const Stack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
const UserStack = createNativeStackNavigator();
const DeliveryStack = createNativeStackNavigator();

// Configure Notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AdminNavigator = ({ handleLogout }) => (
  <AdminStack.Navigator>
    <AdminStack.Screen name="AdminHome" options={{ headerShown: false }}>
      {(props) => <AdminHome {...props} handleLogout={handleLogout} />}
    </AdminStack.Screen>
  </AdminStack.Navigator>
);

const UserNavigator = ({ handleLogout , scheduleNotification}) => (
  <UserStack.Navigator>
    <UserStack.Screen name="UserHome" options={{ headerShown: false }}>
      {(props) => <UserHome {...props} handleLogout={handleLogout} />}
    </UserStack.Screen>
    <UserStack.Screen name="UserMenu" options={{ headerShown: false }}>
      {(props) => <UserMenu {...props} />}
    </UserStack.Screen>
    <UserStack.Screen name="ProductList" options={{ headerShown: false }}>
      {(props) => <ProductList {...props} />}
    </UserStack.Screen>
    <UserStack.Screen name="Product" options={{ headerShown: false }}>
      {(props) => <Product {...props} />}
    </UserStack.Screen>
    <UserStack.Screen name="Wishlist" options={{ headerShown: false }}>
      {(props) => <Wishlist {...props} />}
    </UserStack.Screen>
    <UserStack.Screen name="Cart" options={{ headerShown: false }}>
      {(props) => <Cart {...props} />}
    </UserStack.Screen>
    <UserStack.Screen name="UserAccount" options={{ headerShown: false }}>
      {(props) => <UserAccount {...props} handleLogout={handleLogout} />}
    </UserStack.Screen>
    <UserStack.Screen name="Tracking" options={{ headerShown: false }}>
      {(props) => <TrackingMap {...props} />}
    </UserStack.Screen>
    <UserStack.Screen name="Reminder" options={{ headerShown: false }}>
      {(props) => <ReminderApp {...props} scheduleNotification={scheduleNotification} />}
    </UserStack.Screen>
    <UserStack.Screen name="Services" options={{ headerShown: false }}>
      {(props) => <GardeningServices {...props}/>}
    </UserStack.Screen>
    
  </UserStack.Navigator>
);

const DeliveryNavigator = ({ handleLogout }) => (
  <DeliveryStack.Navigator>
    <DeliveryStack.Screen name="DeliveryHome" options={{ headerShown: false }}>
      {(props) => <DeliveryHome {...props} handleLogout={handleLogout} />}
    </DeliveryStack.Screen>
    <DeliveryStack.Screen name="DeliveryMap" options={{ headerShown: false }}>
      {(props) => <DeliveryTrackingMap {...props}  />}
    </DeliveryStack.Screen>
  </DeliveryStack.Navigator>
);

export default function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('');
  const [name, setName] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [hour, setHour] = React.useState('');
  const [minute, setMinute] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const fetchedRole = await fetchUserRole(currentUser.uid);
        if (fetchedRole) {
          setUser(currentUser);
          console.log(user);
          setUserRole(fetchedRole);
        } else {
          handleSignOut();
        }
      } else {
        setUser(null);
        setUserRole('');
      }
      setLoading(false);
    });

    requestNotificationPermission();

    return () => unsubscribe();
  }, []);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need notification permissions to send reminders.');
    }
  };

  // Function to calculate the time difference and schedule the notification
  const scheduleNotification = async () => {
    const currentDate = new Date();
    const scheduledDate = new Date(currentDate);
    
    // Set the hour and minute based on user input
    scheduledDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

    // Check if the time is in the past and adjust for the next day
    if (scheduledDate <= currentDate) {
      scheduledDate.setDate(scheduledDate.getDate() + 1); // Schedule for the next day
    }

    const timeDifference = scheduledDate - currentDate; // Get the time difference in milliseconds

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder',
        body: 'This is your scheduled reminder!',
      },
      trigger: {
        seconds: timeDifference / 1000, // Convert milliseconds to seconds
      },
    });

    Alert.alert('Notification Scheduled', `Your reminder is set for ${scheduledDate.toLocaleTimeString()}`);
  };

  const fetchUserRole = async (userId) => {
    try {
      const userDocRef = doc(firestore, `users/${userId}`);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        return userSnapshot.data()?.role?.trim()?.toLowerCase() || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole('');
      Toast.show({ type: 'success', text1: 'Logged out successfully!' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  

  const handleAuthentication = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fetchedRole = await fetchUserRole(userCredential.user.uid);
      if (fetchedRole) {
        setUser(userCredential.user);

        setUserRole(fetchedRole);
        
      } else {
        Alert.alert('Error', 'Role not found or user data is corrupted.');
        signOut(auth);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      await setDoc(doc(firestore, 'users', uid), { name, role: 'user' });
      Toast.show({ type: 'success', text1: 'Account created successfully!' });
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!user || !userRole ? (
            <>
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {(props) => (
                  <Login
                    {...props}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    role={role}
                    setRole={setRole}
                    handleAuthentication={handleAuthentication}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="SignUp" options={{ headerTitle: 'Create an Account' }}>
                {(props) => (
                  <View style={styles.container}>
                    <Text style={styles.title}>Create an Account</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Name"
                      value={name}
                      onChangeText={setName}
                    />
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
                    <Button title="Sign Up" onPress={handleSignUp} />
                  </View>
                )}
              </Stack.Screen>
            </>
          ) : userRole === 'admin' ? (
            <Stack.Screen name="Admin" options={{ headerShown: false }}>
              {(props) => <AdminNavigator {...props} handleLogout={handleSignOut} />}
            </Stack.Screen>
          ) : userRole === 'user' ? (
            <Stack.Screen name="User" options={{ headerShown: false }}>
              {(props) => <UserNavigator {...props} handleLogout={handleSignOut} />}
            </Stack.Screen>
          ) : userRole === 'delivery' ? (
            <Stack.Screen name="Delivery" options={{ headerShown: false }}>
              {(props) => <DeliveryNavigator {...props} handleLogout={handleSignOut} />}
            </Stack.Screen>
          ) : null}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});
