import React, { useState, useEffect } from 'react';
import { View, Platform, Text, Image, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from './CartContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { SafeAreaView } from 'react-native-safe-area-context';

const Product = ({ product, navigation }) => {
  const route = useRoute();
  const { plant } = route.params;
  const [cartButtonText, setCartButtonText] = useState('Add to Cart');
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = await AsyncStorage.getItem('favorites');
      const favoritesList = favorites ? JSON.parse(favorites) : [];
      setIsFavorite(favoritesList.some(fav => fav.id === plant.id));
    };
    checkFavorite();
  }, [plant.id]);

  const toggleFavorite = async () => {
    const favorites = await AsyncStorage.getItem('favorites');
    const favoritesList = favorites ? JSON.parse(favorites) : [];

    if (isFavorite) {
      const updatedFavorites = favoritesList.filter(fav => fav.id !== plant.id);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      favoritesList.push(plant);
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesList));
      setIsFavorite(true);
    }
  };

  const handleAddToCart = () => {
    addToCart({ id: plant.id, name: plant.name, price: plant.price, image: plant.image });
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      visibilityTime: 1500,
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Indoor</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* ScrollView to make the product details scrollable */}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image source={{ uri: plant.image }} style={styles.image} />
        <Text style={styles.title}>{plant.name}</Text>
        <Text style={styles.price}>Rs.{plant.price}</Text>

        <Text style={[styles.text, { fontSize: 16 }]}>PRODUCT DESCRIPTION</Text>
        <Text style={styles.text1}>Name: {plant.name}</Text>
        <Text style={styles.text1}>Type: {plant.type}</Text>
        <Text style={styles.text1}>Watering: {plant.watering}</Text>
        <Text style={styles.text1}>Sunlight: {plant.sunlight}</Text>
        <Text style={styles.text1}>Height: {plant.height}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
            <Text style={styles.buttonText}>{cartButtonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              paddingVertical: 10,
              marginBottom: 10,
              paddingHorizontal: 20,
              borderColor: 'green',
              borderWidth: 2,
              borderRadius: 25,
            }}
            onPress={toggleFavorite}
          >
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                fontFamily: 'Roboto',
                textAlign: 'center',
              }}
            >
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.navigationBar}>
        <TouchableOpacity onPress={() => navigation.navigate('UserHome')} style={styles.navigationTab}>
          <Icon name="home" size={24} color="white" />
          <Text style={styles.navigationText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('UserMenu')} style={styles.navigationTab}>
          <Icon name="menu" size={24} color="white" />
          <Text style={styles.navigationText}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Wishlist')} style={styles.navigationTab}>
          <Icon name="favorite" size={24} color="white" />
          <Text style={styles.navigationText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navigationTab}>
          <Icon name="person" size={24} color="white" />
          <Text style={styles.navigationText}>Person</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles are the same, with the added ScrollView adjustments
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  header: { height: 60, backgroundColor: 'black', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 10 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  image: { width: 200, height: 200, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  price: { fontSize: 20, color: 'black', marginBottom: 20 },
  text: { fontSize: 30, fontWeight: 'bold', fontFamily: 'Roboto', marginTop: 15 },
  text1: { fontSize: 16, fontFamily: 'Roboto', marginTop: 5, textAlign: 'center' },
  buttonContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20, width: '85%' },
  button: { backgroundColor: 'green', paddingVertical: 10, marginBottom: 8, paddingHorizontal: 20, borderRadius: 25 },
  buttonText: { color: 'white', fontSize: 18, fontFamily: 'Roboto', textAlign: 'center' },
  navigationBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: Platform.OS === 'ios' ? 75 : 50, flexDirection: 'row', backgroundColor: 'black', borderTopWidth: 1, borderTopColor: '#ddd' },
  navigationTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  navigationText: { color: 'white', fontSize: 12 },
  scrollView: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80,paddingTop:20 }, // Ensure content is scrollable and centered
});

export default Product;
