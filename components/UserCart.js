import React, { useState } from 'react';
import { View, Platform, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

import { useCart } from './CartContext';

const Cart = () => {
  const { cartItems, total, addToCart, handleDelete, decrementQuantity } = useCart();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const incrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.quantity < 10) { 
      addToCart(item);
    }
  };

  const handleProceedToCheckout = () => {
    Alert.alert(
      "Confirm Checkout",
      "Are you sure you want to proceed to checkout?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            setLoading(true);
            try {
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need location permission to proceed.');
                setLoading(false);
                return;
              }
  
              let location = await Location.getCurrentPositionAsync({});
              const pointA = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
  
              navigation.navigate('Tracking', { pointA });
  
            } catch (error) {
              Alert.alert('Error', 'Could not fetch location');
              console.error(error);
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
            <TextInput style={styles.quantityText} value={String(item.quantity)} editable={false} />
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
                <TouchableOpacity style={styles.checkoutButton} onPress={handleProceedToCheckout}>
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
