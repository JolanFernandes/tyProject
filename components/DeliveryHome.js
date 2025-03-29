import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const DeliveryHome = ({ handleLogout, navigation }) => {
  const [liveLocations, setLiveLocations] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  // Fetch live locations from Firestore where status is "live"
  useEffect(() => {
    const fetchLiveLocations = async () => {
      try {
        const usersRef = collection(db, 'users'); // Reference to 'users' collection
        const querySnapshot = await getDocs(usersRef); // Get all users from the collection
        const locationsList = [];

        querySnapshot.forEach((docSnapshot) => {
          const userData = docSnapshot.data();
          const userLocations = userData.locations || [];
          const userName = userData.name || 'Unknown'; // Fetch user's name

          // Filter locations where status is 'live'
          userLocations.forEach((location) => {
            if (location.status === 'live') {
              locationsList.push({
                ...location,
                userId: docSnapshot.id, // Store user ID
                userName: userName, // Store user name
              });
            }
          });
        });

        setLiveLocations(locationsList); // Set the live locations state
      } catch (error) {
        console.error('Error fetching live locations:', error);
      }
    };

    fetchLiveLocations();
  }, []); // Empty dependency array to run once when the component mounts

  // Navigate to TrackingMap with selected location
  const handleLocationClick = (location) => {
    navigation.navigate('DeliveryMap', {
      locationName: location.userName, // Pass userName instead of location name
      coordinates: location.coordinates,
      userId: location.userId,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delivery Home Dashboard</Text>
      <Text style={styles.text}>Welcome to the admin panel. Here you can manage users and locations.</Text>

      {/* Display live locations as a list */}
      <FlatList
        data={liveLocations}
        keyExtractor={(item) => item.userId + item.timestamp} // Unique key for each location
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.locationItem}
            onPress={() => handleLocationClick(item)} // Navigate to map with location details
          >
            <Text style={styles.locationText}>{item.userName}</Text> {/* Show User Name */}
          </TouchableOpacity>
        )}
      />

      {/* Logout Button */}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
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
  locationItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    width: '100%',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeliveryHome;
