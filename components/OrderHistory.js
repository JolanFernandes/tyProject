import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useCart } from './CartContext'; // Assuming you have a cart context
import { useNavigation } from '@react-navigation/native';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const auth = getAuth();
  const { setCartItems } = useCart();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = auth.currentUser.uid;
        const ordersRef = collection(db, `users/${userId}/orders`);
        const snapshot = await getDocs(ordersRef);
        const fetchedOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders.reverse()); // Show latest orders first
      } catch (error) {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'Could not fetch order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleReorder = (items) => {
    setCartItems(items); // Set previous items as new cart
    navigation.navigate('Cart'); // Go to Cart screen
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleString();

    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderId}>Order ID: {item.orderId}</Text>
        <Text style={styles.orderDate}>Date: {formattedDate}</Text>
        <Text style={styles.orderItemsHeader}>Items:</Text>
        {item.items.map((product, idx) => (
          <Text key={idx} style={styles.itemText}>
            {product.name} - Qty: {product.quantity}
          </Text>
        ))}
        <TouchableOpacity
          style={styles.reorderButton}
          onPress={() => handleReorder(item.items)}
        >
          <Text style={styles.reorderText}>Order Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order History</Text>
      {orders.length === 0 ? (
        <Text style={styles.noOrders}>You have no past orders.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noOrders: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  orderCard: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  orderDate: { fontSize: 14, marginBottom: 10 },
  orderItemsHeader: { fontWeight: 'bold', marginTop: 5 },
  itemText: { fontSize: 14, marginLeft: 10 },
  reorderButton: {
    marginTop: 10,
    backgroundColor: 'black',
    paddingVertical: 8,
    borderRadius: 5,
  },
  reorderText: { color: 'white', textAlign: 'center', fontSize: 16 },
});

export default OrderHistory;
