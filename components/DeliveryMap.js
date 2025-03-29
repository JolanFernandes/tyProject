import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getFirestore, doc, updateDoc } from 'firebase/firestore'; 

const DeliveryTrackingMap = ({ navigation }) => {
  const route = useRoute();
  const { locationName, coordinates, userId, locationDocId } = route.params;

  const [liveCoordinates, setLiveCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore();

  // Static start point (predefined location)
  const startPoint = {
    latitude: 15.598293, // Static latitude
    longitude: 73.807998, // Static longitude
  };

  useEffect(() => {
    if (!coordinates) {
      setError('Coordinates not found!');
      setLoading(false);
    } else {
      setLoading(false);
    }

    // Get live location if permission is granted
    const getLiveLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission Denied');
        setLoading(false);
        return;
      }

      // Get live location of the user
      const liveLocation = await Location.getCurrentPositionAsync({});
      setLiveCoordinates({
        latitude: liveLocation.coords.latitude,
        longitude: liveLocation.coords.longitude,
      });
    };

    getLiveLocation();
  }, [coordinates]);

  const handleDelivered = async () => {
    try {
      const locationRef = doc(db, 'users', userId, 'locations', locationDocId);

      // Update status to 'delivered'
      await updateDoc(locationRef, {
        'status': 'delivered',
      });

      console.log('Status updated to delivered!');
      // Navigate to Delivery Home after updating status
      navigation.navigate('DeliveryHome');  // Go to the Delivery Home screen after update
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating status');
    }
  };

  if (loading) {
    return <Text>Loading map...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{locationName}</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coordinates.latitude || startPoint.latitude,
          longitude: coordinates.longitude || startPoint.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Static Start Point */}
        <Marker coordinate={startPoint} title="Start Point" pinColor="blue" />

        {/* Fetched Coordinates */}
        <Marker coordinate={coordinates} title={locationName} pinColor="green" />

        {/* Live Coordinates */}
        {liveCoordinates && (
          <Marker coordinate={liveCoordinates} title="Live Location" pinColor="red" />
        )}

        {/* Polyline from Live Location to Fetched Coordinates */}
        {liveCoordinates && (
          <Polyline
            coordinates={[liveCoordinates, coordinates]}
            strokeColor="blue"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* "Delivered" Button */}
      <TouchableOpacity style={styles.deliveredButton} onPress={handleDelivered}>
        <Text style={styles.deliveredButtonText}>Mark as Delivered</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
  },
  backText: {
    color: 'white',
    fontSize: 16,
  },
  deliveredButton: {
    position: 'absolute',
    bottom: 30,
    left: '10%',
    right: '10%',
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deliveredButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DeliveryTrackingMap;
