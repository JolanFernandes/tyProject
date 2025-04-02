import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from './CartContext';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView

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
    setFavourites(favourites.filter((fav) => fav.id !== item.id));
    Toast.show({
      type: 'info',
      text1: 'Added to Cart', // Ensured all strings are correctly wrapped
      visibilityTime: 4000,
      position: 'center',
    });
  };

  const handleDelete = (itemId) => {
    const updatedFavorites = favourites.filter((fav) => fav.id !== itemId);
    setFavourites(updatedFavorites);
    AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  if (!favourites || favourites.length === 0) {
    return (
      <SafeAreaView style={styles.container}> {/* SafeAreaView ensures proper spacing */}
        <View style={styles.noFavoritesContainer}> {/* View properly wraps Text */}
          <Text style={styles.noFavoritesText}>No favorites yet!</Text> {/* Correctly placed Text */}
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
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
          {/* Delete Button */}
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
            <Icon name="trash" size={20} color="red" />
          </TouchableOpacity>
          {/* Add to Cart Button */}
          <TouchableOpacity onPress={() => handleAddToCart(item)} style={styles.addToCartButton}>
            <Text style={styles.buttonText}>Add to Cart</Text> {/* Text correctly wrapped */}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}> {/* SafeAreaView wraps FlatList */}
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id} // KeyExtractor ensures proper IDs
        numColumns={2}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  noFavoritesContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // Center the message
  noFavoritesText: { fontSize: 18, color: 'gray', fontWeight: 'bold' }, // Proper styling for "No favorites yet!"
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
