import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';

const DeliveryMap = ({ navigation }) => {
  const route = useRoute();
  const { userId, orderId } = route.params; // Passed from DeliveryHome

  const [destinationCoordinates, setDestinationCoordinates] = useState(null); // User's destination
  const [deliveryCoordinates, setDeliveryCoordinates] = useState(null); // Delivery person's live location
  const db = getFirestore();

  // Static Nursery Location
  const nurseryCoordinates = {
    latitude: 15.590386, // Sai Nursery latitude
    longitude: 73.810582, // Sai Nursery longitude
  };

  useEffect(() => {
    const fetchOrderDestination = async () => {
      try {
        // Fetch user's destination from orders
        const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
        const orderSnapshot = await getDoc(orderRef);

        if (orderSnapshot.exists()) {
          const { location } = orderSnapshot.data(); // Assuming "location" contains user's coordinates
          setDestinationCoordinates({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        } else {
          console.error('Destination not found for the order.');
        }
      } catch (error) {
        console.error('Error fetching order destination:', error);
      }
    };

    const trackDeliveryLocation = () => {
      // Listen for delivery person's live location in Firestore
      const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
      const unsubscribe = onSnapshot(orderRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const { deliveryLocation } = docSnapshot.data();
          if (deliveryLocation) {
            setDeliveryCoordinates({
              latitude: deliveryLocation.latitude,
              longitude: deliveryLocation.longitude,
            });
          }
        }
      });

      return unsubscribe;
    };

    const updateLiveLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need location permission to show your position.');
          return;
        }

        const liveLocation = await Location.getCurrentPositionAsync({});
        const orderRef = doc(db, `users/${userId}/orders/${orderId}`);

        // Update delivery person's live location in Firestore
        await updateDoc(orderRef, {
          deliveryLocation: {
            latitude: liveLocation.coords.latitude,
            longitude: liveLocation.coords.longitude,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error updating delivery location:', error);
      }
    };

    // Update delivery location periodically
    const intervalId = setInterval(updateLiveLocation, 90000); // Every 90 seconds

    const unsubscribeDeliveryLocation = trackDeliveryLocation();
    fetchOrderDestination(); // Fetch user's destination

    return () => {
      clearInterval(intervalId); // Clear interval when component unmounts
      unsubscribeDeliveryLocation(); // Clean up Firestore listener
    };
  }, [userId, orderId, db]);

  const handleDelivered = async () => {
    Alert.alert(
      'Confirm Delivery',
      'Are you sure you want to mark this order as delivered?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
              await updateDoc(orderRef, { deliveryStatus: 'Delivered' }); // Update order status to delivered
              Alert.alert('Success', 'Order has been marked as delivered.');
              navigation.navigate('DeliveryHome'); // Navigate back to DeliveryHome
            } catch (error) {
              console.error('Error updating delivery status:', error);
              Alert.alert('Error', 'Failed to update delivery status.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: nurseryCoordinates.latitude,
          longitude: nurseryCoordinates.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Static Nursery Location Marker */}
        <Marker coordinate={nurseryCoordinates} title="Sai Nursery" pinColor="green" />

        {/* User's Destination Marker */}
        {destinationCoordinates && (
          <Marker
            coordinate={destinationCoordinates}
            title="User's Destination"
            pinColor="orange"
          />
        )}

        {/* Delivery Person's Live Location Marker */}
        {deliveryCoordinates && (
          <Marker
            coordinate={deliveryCoordinates}
            title="Delivery Person"
            pinColor="blue"
          />
        )}

        {/* Path from Delivery Person to User */}
        {destinationCoordinates && deliveryCoordinates && (
          <Polyline
            coordinates={[deliveryCoordinates, destinationCoordinates]}
            strokeColor="green"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Delivered Button */}
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
  map: {
    flex: 1,
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
});

export default DeliveryMap;
