import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from './CartContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';

const Wishlist = () => {
  const [favourites, setFavourites] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favorites = await AsyncStorage.getItem('favorites');
        console.log('Loaded favorites from AsyncStorage:', favorites); // Debugging log

        const favouritesList = favorites ? JSON.parse(favorites) : [];
        setFavourites(favouritesList);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item);
    setFavourites(favourites.filter(fav => fav.id !== item.id));
    Toast.show({
      type: 'info',
      text1: 'Added to Cart',
      visibilityTime: 4000,
      position: 'center',
    });
  };

  const handleDelete = (itemId) => {
    const updatedFavorites = favourites.filter(fav => fav.id !== itemId);
    setFavourites(updatedFavorites);
    AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  if (!favourites || favourites.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No favorites yet!</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    // Debugging log for individual items
    console.log('Rendering item:', item);

    // Ensure that each item has the expected properties before rendering
    if (!item || !item.id || !item.name || !item.image || !item.price) {
      console.warn('Invalid item in favourites:', item); // Warn if an item is malformed
      return null;
    }

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rs. {item.price}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <Icon name="trash" size={20} color="red" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleAddToCart(item)} style={styles.addToCartButton}>
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id} // Safely convert ID to string
        numColumns={2}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  itemContainer: { width: '45%', marginBottom: 20, marginHorizontal: 10 },
  image: { width: '100%', height: 150, borderRadius: 10 },
  itemName: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  itemPrice: { fontSize: 14, color: 'gray', marginTop: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  deleteButton: { padding: 5, borderRadius: 5, backgroundColor: '#f8d7da' },
  addToCartButton: { paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#28a745', borderRadius: 5 },
  buttonText: { color: 'white', fontSize: 14 },
});

export default Wishlist;
