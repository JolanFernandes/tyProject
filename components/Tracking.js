import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc,updateDoc,collection } from 'firebase/firestore';

const TrackingMap = ({ navigation }) => {
  const [initialLocation, setInitialLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static destination (Point B)
  const pointB = {
    latitude: 15.590386,
    longitude: 73.810582,
  };

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  // Function to save location to Firestore
  const saveLocation = async (userId, locationName, coordinates) => {
    try {
      // Get a reference to the user document
      const userDocRef = doc(db, 'users', userId);
  
      // Fetch the current user data
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        // Get the existing locations field, or initialize it as an empty array if it doesn't exist
        const existingLocations = userDocSnapshot.data().locations || [];
  
        // Add the new location with status as "live"
        const newLocation = {
          name: locationName,
          coordinates: coordinates,
          status: 'live', // Initial status is set to "live"
          timestamp: new Date().toISOString(), // Current timestamp
        };
  
        // Update the locations field with the new location added
        await updateDoc(userDocRef, {
          locations: [...existingLocations, newLocation], // Append new location
        });
  
        console.log('Location saved successfully with status "live"!');
      } else {
        console.error('User document does not exist');
      }
    } catch (error) {
      console.error('Error saving location: ', error);
    }
  };
  

  useEffect(() => {
    let locationSubscription;

    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location permission to track your position.');
        return;
      }

      // Get initial location (Point A)
      let location = await Location.getCurrentPositionAsync({});
      setInitialLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Start tracking user's movement
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 2000,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });

          setLocationHistory((prevHistory) => [...prevHistory, { latitude, longitude }]);

          // Store the user's live location in Firestore
          if (currentUser) {
            // Save location history to Firestore
            await saveLocation(currentUser.uid, 'User Location', { latitude, longitude });

            // Store the user's live location in Firestore (you could store it in a different sub-collection if needed)
            await setDoc(doc(firestore, 'locations', currentUser.uid), {
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            });
          }
        }
      );

      setLoading(false);
    };

    getLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: initialLocation ? initialLocation.latitude : 15.598293,
          longitude: initialLocation ? initialLocation.longitude : 73.807998,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Static Destination */}
        <Marker coordinate={pointB} title="Destination (B)" pinColor="red" />

        {/* User's initial location (Static A) */}
        {initialLocation && <Marker coordinate={initialLocation} title="Starting Point (A)" pinColor="blue" />}

        {/* Moving User Marker (Point C) */}
        {userLocation && <Marker coordinate={userLocation} title="Your Location (C)" pinColor="green" />}

        {/* Path from A (initial location) to B */}
        {initialLocation && (
          <Polyline coordinates={[initialLocation, pointB]} strokeColor="blue" strokeWidth={3} />
        )}

        {/* Path from C (live location) to B */}
        {userLocation && (
          <Polyline coordinates={[userLocation, pointB]} strokeColor="green" strokeWidth={3} />
        )}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.text}>{loading ? 'Fetching location...' : 'Tracking your location...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  text: {
    position: 'absolute',
    top: 20,
    left: 20,
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    borderRadius: 5,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 30,
  },
});

export default TrackingMap;
