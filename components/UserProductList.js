import React, { useState , useEffect} from "react"; 
import { View, TextInput, Platform, Text, Image, FlatList, StyleSheet, TouchableOpacity } from "react-native"; 
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { useRoute } from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const plants = [ 
  { id: "1", name: "SPIDER PLANT", price: "100", type: "Indoor and Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://asset.bloomnation.com/c_pad,d_vendor:global:catalog:product:image.png,f_auto,fl_preserve_transparency,q_auto/v1605539373/vendor/5422/catalog/product/2/0/20200716061734_file_5f1099be7ad7d_5f109d07acb9d.jpg" },
  { id: "2", name: "MOTHER IN LAW'S TONGUE PLANT", price: "900", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://i.pinimg.com/originals/40/fd/1f/40fd1f45e07d5113af1b7d972985767b.jpg" },
  { id: "3", name: "CACTUS", price: "806", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://www.thespruce.com/thmb/C3P6YItJGAutSQyEHbVlyGmOvPM=/1949x1539/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-154456122-59e51b7d03f4020011cca0ea.jpg" },
  { id: "4", name: "JADE PLANT", price: "80", type: "Indoor ", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://www.gardeningknowhow.com/wp-content/uploads/2020/11/succulent-houseplant-crassula-1536x1152.jpg" },
  { id: "5", name: "RUBBER PLANT", price: "80", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://th.bing.com/th/id/OIP.pitsm3pWMQS7l1as1htBegHaLH?rs=1&pid=ImgDetMain" },
  { id: "6", name: "MAIDENHAIR PLANT", price: "80", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://i.pinimg.com/originals/33/52/46/3352461dfd3b0cefa5627e4cca9d82df.jpg" },
  { id: "7", name: "CROTON PLANT", price: "80", type: "Indoor and Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://th.bing.com/th/id/OIP.tq0qc1jKyE29vY9Rj_n0UgHaHF?rs=1&pid=ImgDetMain" },
  { id: "8", name: "COLEUS GREEN", price: "80", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://c8.alamy.com/comp/B79PK3/green-coleus-pot-plant-B79PK3.jpg" },
  { id: "9", name: "SPIDER PLANT", price: "100", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://asset.bloomnation.com/c_pad,d_vendor:global:catalog:product:image.png,f_auto,fl_preserve_transparency,q_auto/v1605539373/vendor/5422/catalog/product/2/0/20200716061734_file_5f1099be7ad7d_5f109d07acb9d.jpg" },
  { id: "10", name: "MOTHER IN LAW'S TONGUE PLANT", price: "900", type: "Indoor and Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://i.pinimg.com/originals/40/fd/1f/40fd1f45e07d5113af1b7d972985767b.jpg" },
  { id: "11", name: "CACTUS", price: "806", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://www.thespruce.com/thmb/C3P6YItJGAutSQyEHbVlyGmOvPM=/1949x1539/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-154456122-59e51b7d03f4020011cca0ea.jpg" },
  { id: "12", name: "JADE PLANT", price: "345", type: "Indoor and Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://www.gardeningknowhow.com/wp-content/uploads/2020/11/succulent-houseplant-crassula-1536x1152.jpg" },
  { id: "13", name: "RUBBER PLANT", price: "510", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://th.bing.com/th/id/OIP.pitsm3pWMQS7l1as1htBegHaLH?rs=1&pid=ImgDetMain" },
  { id: "14", name: "MAIDENHAIR PLANT", price: "80", type: "Indoor and Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://i.pinimg.com/originals/33/52/46/3352461dfd3b0cefa5627e4cca9d82df.jpg" },
  { id: "15", name: "CROTON PLANT", price: "80", type: "Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight", height: "12-15 inches when fully grown", image: "https://th.bing.com/th/id/OIP.tq0qc1jKyE29vY9Rj_n0UgHaHF?rs=1&pid=ImgDetMain" },
  { id: "16", name: "COLEUS GREEN", price: "80", type: "Indoor and Outdoor", watering: "1 inch of water every two days", sunlight: "Bright indirect sunlight",  height: "12-15 inches when fully grown", image: "https://c8.alamy.com/comp/B79PK3/green-coleus-pot-plant-B79PK3.jpg" },
];

const ProductList = ({navigation}) => {
  const [hearts, setHearts] = useState({});
  const [favorites, setFavorites] = useState([]);  // Store favorites list
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // For page-specific search
  const [showSearchInput, setShowSearchInput] = useState(false); // Track visibility of TextInput
  const route = useRoute();
  const searchQuery = route.params?.query || "";
  
  console.log("Received query:", searchQuery); // Debugging
  const [filteredPlants, setFilteredPlants] = useState(plants);
  
  
  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    };
    loadFavorites();
  }, []);

   const toggleHeart = async (id, item) => {
    let updatedFavorites;
    if (favorites.some(fav => fav.id === id)) {
      // If already in favorites, remove it
      updatedFavorites = favorites.filter(fav => fav.id !== id);
    } else {
      // Add to favorites if not already present
      updatedFavorites = [...favorites, item];
    }
    setFavorites(updatedFavorites);
    // Save the updated list to AsyncStorage
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };


  const handleSearch = () => {
    const query = localSearchQuery.trim();
    if (query === "") {
      setFilteredPlants(plants); // Reset to full list
    } else {
      const filtered = plants.filter((plant) =>
        plant.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPlants(filtered);
    }
  };
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const filtered = plants.filter((plant) =>
        plant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log("Filtered plants:", filtered); // Debugging
      setFilteredPlants(filtered);
    } else {
      setFilteredPlants(plants);
    }
  }, [searchQuery]);
  const renderItem = ({ item }) => ( 
    <TouchableOpacity onPress={() => navigation.navigate('Product', { plant: item })}> 
      <View style={styles.card}> 
        <Image source={{ uri: item.image }} style={styles.image} /> 
        <View style={styles.textContainer}> 
          <Text style={styles.name}>{item.name}</Text> 
          <Text style={styles.price}>{item.price}</Text> 
        </View> 
        <TouchableOpacity style={styles.heart} onPress={() => toggleHeart(item.id, item)}> 
          <Icon name="favorite" size={30} color={favorites.some(fav => fav.id === item.id)? 'red' : 'pink'} /> 
        </TouchableOpacity> 
      </View> 
    </TouchableOpacity> 
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSearchInput(prev => !prev)}>
          <Icon name="search" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Show/hide the search input */}
      {showSearchInput && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Search for a plant..."
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
            onSubmitEditing={handleSearch} // Pressing enter triggers search
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList 
        style={{ marginBottom: 50 }}
        data={filteredPlants} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem} 
        contentContainerStyle={styles.container} 
      />

      {/* Bottom Navigation Bar */}
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
          <TouchableOpacity  style={styles.navigationTab} onPress={() =>navigation.navigate('UserAccount')}>
            <Icon name="person" size={24} color="white" />
            <Text style={styles.navigationText}>Person</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: 'black',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  textInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingLeft: 10,
    fontSize: 16,
    borderRadius: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  container: {
    padding: 10,
    backgroundColor: "white",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginVertical: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "green",
    overflow: "visible",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "#555",
  },
  heart: {
    padding: 10,
    justifyContent: "center",
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 75 : 50,
    flexDirection: 'row', 
    backgroundColor: 'black',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navigationTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  navigationText: {
    color: 'white',
    fontSize: 12,
  },
});

export default ProductList;