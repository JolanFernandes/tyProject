import React, { useState , useEffect} from "react"; 
import { View, TextInput, Platform, Text, Image, FlatList, StyleSheet, TouchableOpacity } from "react-native"; 
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { useRoute } from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
const plants = [
    // Pots
    {
      id: "1",
      name: "CERAMIC PLANTER POT",
      price: "400",
      type: "Pot",
      description: "A stylish ceramic planter perfect for displaying your indoor plants.",
      material: "High-quality ceramic",
      size: "10 inches diameter",
      image: "https://plantlane.com/cdn/shop/files/DSC09762.jpg?v=1712320907"
    },
    {
      id: "2",
      name: "TERRACOTTA PLANTER POT",
      price: "250",
      type: "Pot",
      description: "Classic terracotta planter suitable for both indoor and outdoor plants.",
      material: "Natural terracotta",
      size: "12 inches diameter",
      image: "https://brownliving.in/cdn/shop/products/gamla-for-plants-mud-pot-for-plants-terracotta-pots-for-plants-6-inch-pots-for-plants-pots-planters-gold-dust-brown-living-478850.jpg?v=1723805265&width=400"
    },
    {
      id: "3",
      name: "DECORATIVE PLANTER - GOLD",
      price: "700",
      type: "Pot",
      description: "Elegant decorative planter with a golden finish for premium indoor plants.",
      material: "Metal with gold coating",
      size: "12 inches diameter",
      image: "https://m.media-amazon.com/images/I/51glbqZ6RBL._SX300_SY300_QL70_FMwebp_.jpg"
    },
    {
      id: "4",
      name: "PLASTIC GARDEN POT",
      price: "100",
      type: "Pot",
      description: "Durable and lightweight plastic garden pot ideal for versatile use.",
      material: "Recyclable plastic",
      size: "8 inches diameter",
      image: "https://horticult.co/spree/products/1665/product/Rectangle-Planter-4-Pot-With-Tray-plastic-pots-garden-pots-Horticult.jpeg?1615398177"
    },
  
    // Seeds
    {
      id: "5",
      name: "SUNFLOWER SEEDS",
      price: "50",
      type: "Seeds",
      description: "Easy-to-grow sunflower seeds that bloom into vibrant yellow flowers.",
      sowing: "Sow directly into well-drained soil",
      sunlight: "Full sunlight",
      growth_period: "8-12 weeks to bloom",
      image: "https://www.themewashoppe.in/uploads/ProductImages/3c3dd0fc-a03c-4d87-8d8f-72ff4960ff0e_711phddr1zl._ac_uf1000,1000_ql80_.jpg"
    },
    {
      id: "6",
      name: "HERB SEEDS - BASIL",
      price: "80",
      type: "Seeds",
      description: "Grow fresh basil with these high-quality herb seeds.",
      sowing: "Sow in seed trays or directly into soil",
      sunlight: "Partial sunlight",
      growth_period: "6-8 weeks to harvest",
      image: "https://5.imimg.com/data5/VN/JG/CW/SELLER-12687905/indian-herb-basil-seeds-1000x1000.jpg"
    },
    {
      id: "7",
      name: "VEGETABLE SEEDS - TOMATO",
      price: "100",
      type: "Seeds",
      description: "Premium tomato seeds for growing your own vegetables at home.",
      sowing: "Plant in nutrient-rich soil",
      sunlight: "Full sunlight",
      growth_period: "10-12 weeks to harvest",
      image: "https://urbanplants.co.in/cdn/shop/products/adarsh-kisan-mart-seeds-tomato-op-vegetable-seeds-buy-tomato-op-vegetable-seeds-online-38659853975767_720x.jpg?v=1672525408"
    },
    {
      id: "8",
      name: "VEGETABLE SEEDS - SPINACH",
      price: "60",
      type: "Seeds",
      description: "Easy-to-grow spinach seeds for fresh leafy greens.",
      sowing: "Plant directly into moist soil",
      sunlight: "Partial sunlight",
      growth_period: "6-8 weeks to harvest",
      image: "https://images.meesho.com/images/products/471315304/ztlxz_512.webp"
    },
    {
      id: "9",
      name: "FLOWER SEEDS - MARIGOLD",
      price: "70",
      type: "Seeds",
      description: "Vibrant marigold seeds ideal for brightening up your garden.",
      sowing: "Sow directly into well-drained soil",
      sunlight: "Full sunlight",
      growth_period: "6-8 weeks to bloom",
      image: "https://i0.wp.com/potsia.com/wp-content/uploads/2023/03/marigold-flower-seeds.jpg?fit=1200%2C1200&ssl=1"
    },
    {
      id: "10",
      name: "HERB SEEDS - MINT",
      price: "85",
      type: "Seeds",
      description: "Fresh mint herb seeds to grow aromatic leaves at home.",
      sowing: "Plant in moist soil and keep shaded for best results",
      sunlight: "Partial sunlight",
      growth_period: "6-7 weeks to harvest",
      image: "https://images-cdn.ubuy.co.in/634fb31766fb54757e69b20e-peppermint-herb-seed-balls-mentha.jpg"
    }
  ];
  
const SeedsandPots = ({navigation}) => {
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

export default SeedsandPots;