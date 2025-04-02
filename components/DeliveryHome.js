import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const DeliveryHome = ({ handleLogout, navigation }) => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const db = getFirestore();

  // Fetch all pending orders from all users, including userId
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const usersRef = collection(db, 'users'); // Reference to users collection
        const usersSnapshot = await getDocs(usersRef); // Get all user documents
  
        const ordersPromises = usersSnapshot.docs.map(async (userDoc) => {
          const userId = userDoc.id;
          const userData = userDoc.data();
          const userName = userData.name || 'Unknown';
  
          const ordersRef = collection(db, `users/${userId}/orders`); // Reference to orders sub-collection
          const ordersSnapshot = await getDocs(ordersRef);
  
          const userOrders = ordersSnapshot.docs.map((orderDoc) => {
            const orderData = orderDoc.data();
            if (orderData.deliveryStatus === 'Pending') {
              return {
                ...orderData,
                userId,
                userName,
                orderId: orderDoc.id,
              };
            }
            return null; // Ignore non-pending orders
          });
  
          return userOrders.filter((order) => order !== null); // Filter out null values
        });
  
        // Wait for all promises to resolve
        const resolvedOrders = await Promise.all(ordersPromises);
  
        // Flatten the array of orders and deduplicate using a Map
        const flattenedOrders = resolvedOrders.flat();
        const uniqueOrders = Array.from(
          new Map(flattenedOrders.map((order) => [`${order.userId}-${order.orderId}`, order])).values()
        );
  
        setPendingOrders(uniqueOrders); // Update state once with deduplicated orders
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    };
  
    fetchPendingOrders();
  }, []);
  

  // Navigate to DeliveryMap with selected order details
  const handleOrderClick = (order) => {
    navigation.navigate('DeliveryMap', {
      orderId: order.orderId,
      userId: order.userId,
      userName: order.userName,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delivery Home Dashboard</Text>
      <Text style={styles.text}>Manage pending orders from all users.</Text>

      {/* Display pending orders */}
      <FlatList
        data={pendingOrders}
        keyExtractor={(item) => `${item.userId}-${item.orderId}`} // Unique key for each order
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderItem}
            onPress={() => handleOrderClick(item)} // Navigate to map with order details
          >
            <Text style={styles.orderText}>User: {item.userName}</Text>
            <Text style={styles.orderText}>Order ID: {item.orderId}</Text>
            <Text style={styles.orderText}>Status: {item.deliveryStatus}</Text>
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
  orderItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    width: '100%',
  },
  orderText: {
    fontSize: 16,
  },
});

export default DeliveryHome;
