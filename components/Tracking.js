import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const TrackingMap = ({ navigation, route }) => {
  const { userId, orderId, userLocation } = route.params; // Passed from Cart or Orders screen
  const [deliveryPersonLocation, setDeliveryPersonLocation] = useState(null); // Delivery person's location
  const [loading, setLoading] = useState(true);

  // Hardcoded Sai Nursery location
  const pointB = {
    latitude: 15.590386,
    longitude: 73.810582,
  };

  const db = getFirestore();

  useEffect(() => {
    console.log(`Monitoring delivery status for userId: ${userId}, orderId: ${orderId}`);

    // Monitor delivery person's location
    const monitorDeliveryPerson = () => {
      const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
      const unsubscribe = onSnapshot(orderRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const { deliveryLocation } = docSnapshot.data();
          if (deliveryLocation) {
            setDeliveryPersonLocation({
              latitude: deliveryLocation.latitude,
              longitude: deliveryLocation.longitude,
            });
            console.log('Delivery person location updated:', deliveryLocation);
          }
        } else {
          console.error('Order document does not exist.');
        }
      });

      return unsubscribe;
    };

    // Monitor delivery status and show popup if Delivered
    const monitorDeliveryStatus = () => {
      const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
      const unsubscribe = onSnapshot(orderRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const { deliveryStatus } = docSnapshot.data();
          console.log('Current delivery status:', deliveryStatus);

          if (deliveryStatus === 'Delivered') {
            console.log('Delivery status changed to "Delivered". Showing popup...');
            Alert.alert(
              'Delivery Complete',
              'Your order has been delivered. Thank you for shopping with us!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack(); // Automatically navigate to Cart
                  },
                },
              ]
            );
          }
        } else {
          console.error('Order document does not exist.');
        }
      });

      return unsubscribe;
    };

    // Start monitoring delivery person and delivery status
    const unsubscribeDelivery = monitorDeliveryPerson();
    const unsubscribeStatus = monitorDeliveryStatus();

    setLoading(false);

    // Clean up listeners on unmount
    return () => {
      unsubscribeDelivery();
      unsubscribeStatus();
    };
  }, [userId, orderId, db, navigation]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Hardcoded Nursery Location Marker */}
        <Marker coordinate={pointB} title="Sai Nursery" pinColor="red" />

        {/* User's Location Marker */}
        <Marker coordinate={userLocation} title="Your Location" pinColor="blue" />

        {/* Delivery Person's Location Marker */}
        {deliveryPersonLocation && (
          <Marker
            coordinate={deliveryPersonLocation}
            title="Delivery Person"
            pinColor="purple"
          />
        )}

        {/* Polyline: User to Nursery */}
        <Polyline coordinates={[userLocation, pointB]} strokeColor="green" strokeWidth={3} />

        {/* Polyline: User to Delivery Person */}
        {deliveryPersonLocation && (
          <Polyline coordinates={[userLocation, deliveryPersonLocation]} strokeColor="blue" strokeWidth={3} />
        )}
      </MapView>

      {/* Back Button */}
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
