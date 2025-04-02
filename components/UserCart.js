import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCart } from './CartContext';
import { getFirestore, doc, collection, addDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Cart = () => {
  const { cartItems, total, addToCart, handleDelete, decrementQuantity, setCartItems } = useCart(); // Added setCartItems to clear cart
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(false);

  const incrementQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantity < 10) {
      addToCart(item);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data(); // Fetch name and email
      } else {
        console.log('No user data found.');
        return { name: '', email: '' }; // Fallback if data doesn't exist
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return { name: '', email: '' };
    }
  };
  const saveOrderToFirestore = async (location, userDetails) => {
    try {
      const userId = auth.currentUser.uid; // Current user ID
  
      // Generate a random order ID
      const orderId = `ORD-${Math.random().toString(36).substr(2, 9)}`;
  
      // Define nursery's static location as initial deliveryLocation
      const nurseryLocation = {
        latitude: 15.590386, // Sai Nursery latitude
        longitude: 73.810582, // Sai Nursery longitude
        timestamp: new Date().toISOString(),
      };
  
      // Define order details
      const orderDetails = {
        orderId,             // Random order ID
        userId,              // Current user ID
        name: userDetails.name,
        email: userDetails.email,
        items: cartItems,    // Cart items
        total,               // Total value
        location,            // User's current location
        deliveryStatus: 'Pending',
        deliveryLocation: nurseryLocation,
        timestamp: new Date().toISOString(),
      };
  
      // Add order to Firestore under user's document
      const ordersCollectionRef = collection(db, `users/${userId}/orders`);
      const docRef = await addDoc(ordersCollectionRef, orderDetails); // Create document and get its reference
  
      // Save full cart details to adminOrders collection
      const adminOrdersCollectionRef = collection(db, 'adminOrders');
      await addDoc(adminOrdersCollectionRef, { ...orderDetails }); // Reuse the same order details
  
      console.log('Order placed successfully:', docRef.id); // Log the document ID
      return docRef.id; // Return the document ID
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
      Alert.alert('Error', 'An error occurred while placing your order.');
      throw error; // Ensure error is propagated
    }
  };
  const handleProceedToCheckout = async () => {
    Alert.alert(
      'Confirm Checkout',
      'Are you sure you want to proceed to checkout?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setLoading(true);
            try {
              // Request location permission
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need location permission to proceed.');
                setLoading(false);
                return;
              }
  
              // Fetch user's current location
              let location = await Location.getCurrentPositionAsync({});
              const myloc = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
  
              // Fetch user details from Firestore
              const userDetails = await fetchUserDetails();
  
              // Save order to Firestore and get document ID
              const orderDocId = await saveOrderToFirestore(myloc, userDetails);
  
              // Navigate to TrackingMap with required parameters
              navigation.navigate('Tracking', {
                userId: auth.currentUser.uid, // Current user ID
                orderId: orderDocId,         // Document ID returned from saveOrderToFirestore
                userLocation: myloc,         // User's current location
              });
  
              // Clear the cart
              setCartItems([]);
            } catch (error) {
              Alert.alert('Error', 'Could not fetch location');
              console.error('Error:', error);
            }
            setLoading(false);
          },
        },
      ]
    );
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.descriptionContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDetails}>Price: Rs. {item.price}</Text>
        <Text style={styles.productDetails}>Quantity: {item.quantity}</Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.trashIcon}>
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
              <Icon name="remove" size={20} color="black" />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityText}
              value={String(item.quantity)}
              editable={false}
            />
            <TouchableOpacity onPress={() => incrementQuantity(item.id)}>
              <Icon name="add" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Cart</Text>
        <Icon name="shopping-cart" size={30} color="black" />
      </View>
      <View style={styles.container}>
        {cartItems.length === 0 ? (
          <Text style={styles.message}>Your cart is empty</Text>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={
              <View style={styles.orderSummaryContainer}>
                <Text style={styles.orderSummary}>Order Summary:</Text>
                <Text style={styles.total}>Order Value: Rs. {total - 30}</Text>
                <Text style={styles.total}>Delivery: Rs. 30</Text>
                <Text style={styles.total}>Total: Rs. {total}</Text>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={handleProceedToCheckout}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.checkoutText}>Proceed to checkout</Text>
                  )}
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
      {/* Floating Delivery Icon */}
      <TouchableOpacity
        style={styles.floatingIcon}
        onPress={() => navigation.navigate('Tracking')}
      >
        <Icon name="location-on" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  header: {
    height: 60,
    backgroundColor: 'black',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  container: { flex: 1, padding: 20 },
  message: { fontSize: 16, textAlign: 'center' },
  productContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: { width: 100, height: 100, marginRight: 20 },
  productName: { fontSize: 18, fontWeight: 'bold' },
  productDetails: { fontSize: 16 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  trashIcon: { marginRight: 10 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 60 },
  quantityText: {
    width: 40,
    height: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 10,
    borderRadius: 5,
  },
  orderSummaryContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  orderSummary: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  total: { fontSize: 18, marginTop: 5, textAlign: 'center' },
  checkoutButton: {
    backgroundColor: 'black',
    borderRadius: 25,
    marginBottom: 10,
    height: 45,
    width: 250,
    justifyContent: 'center',
  },
  checkoutText: { color: 'white', textAlign: 'center', fontSize: 18 },
});

export default Cart;
