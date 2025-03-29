import React, { useState, useEffect, useRef } from 'react';
import { View,TextInput, Platform, Text,Linking, Button, ScrollView, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { signOut } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const UserHome = ({ handleLogout, navigation }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const auth = getAuth();
  const db = getFirestore();

 const [showSearchInput, setShowSearchInput] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");

  const { width } = Dimensions.get('window');
  const imageWidth = width * 0.9;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const [imageUrls, setImageUrls] = useState([null, null, null]); // Store image URLs

  const handleMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / imageWidth);
    setCurrentIndex(index);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      handleLogout();
    } catch (error) {
      console.error('Sign out error:', error.message);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const navigateToChat = () => {
    setDropdownVisible(false);
    navigation.navigate('ChatScreen');
  };
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigation.navigate("ProductList", { query: searchQuery.trim() });
      setSearchQuery(""); // Reset search input
    }
  };


  // Fetch URLs from Firestore
  const fetchImageUrls = async () => {
    try {
      const plants = ['moneyplantIndian', 'abolimplantIndian', 'snakeplantIndian']; // Replace with actual document IDs
      const urls = await Promise.all(
        plants.map(async (plantId) => {
          const docRef = doc(db, 'plants', plantId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return docSnap.data().url; // Assumes `url` field exists in each document
          } else {
            console.error(`No document found for ${plantId}`);
            return null;
          }
        })
      );
      setImageUrls(urls);
    } catch (error) {
      console.error('Error fetching image URLs:', error);
    }
  };
  
  
    const openWhatsApp = () => {
      const phoneNumber = '+918830318137'; // Replace with actual number
      const message = 'Hello! , I had a Query to be answered...';
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
      });
    };

  useEffect(() => {
    fetchImageUrls();
  }, []);

  return (
    <SafeAreaView style={styles.headercontainer}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => setShowSearchInput(prev => !prev)}>
          <Icon name="search" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity  onPress={() => navigation.navigate('Cart')}>
       <Icon name="shopping-cart" size={30} color="white" />
       </TouchableOpacity>
      </View>
      {/* Show/hide the search input */}
     {showSearchInput && (
             <TextInput
               style={styles.textInput}
               placeholder="Search plants..."
               value={searchQuery}
               onChangeText={setSearchQuery}
               onSubmitEditing={handleSearch} // Press Enter to search
             />
                          )
        }
     
      {/* Content Area */}
      <View style={styles.container}>
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            onMomentumScrollEnd={handleMomentumScrollEnd}
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          >
            {imageUrls.map((url, index) => (
              <View key={index} style={[styles.imageWrapper, { width: imageWidth, height: imageWidth }]}>
                {url ? (
                  <Image source={{ uri: url }} style={styles.plantImage} resizeMode="contain" />
                ) : (
                  <Text>Loading...</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.dotsContainer}>
          {imageUrls.map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={openWhatsApp}>
          <View style={styles.buttonContent}>
            <Icon name="message" size={30} color="white" />
            <Text style={styles.buttonText}>Chat With Expert</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Tracking')}>
            <Icon name="local-offer" size={50} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
            <Icon name="favorite" size={50} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Reminder')}>
            <Icon name="notifications" size={50} color="white" />
          </TouchableOpacity>
        </View>
      </View>

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
        <TouchableOpacity  style={styles.navigationTab} onPress={() =>navigation.navigate('UserAccount')}>
          <Icon name="person" size={24} color="white" />
          <Text style={styles.navigationText}>Person</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
    paddingBottom: '10%',
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
  dropdownButton: {
    padding: 10,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    color: 'green',
  },
  carouselContainer: {
    width: '90%',
    marginBottom: 20,
    paddingTop: 10,
  },
  carousel: {
    height: 320,
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 5,
  },
  plantImage: {
    width: '90%',
    height: '90%',
    borderRadius: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    margin: 5,
  },
  activeDot: {
    backgroundColor: '#376323',
  },
  button: {
    backgroundColor: '#376323',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    height: '12%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    width: '100%',
    height: Platform.OS === 'ios' ? 40 : 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingLeft: 10,
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 15,
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '95%',
    marginBottom: 20,
  },
  iconButton: {
    backgroundColor: '#376323',
    width: 80,
    height: 80,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
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
  },
  navigationText: {
    color: 'white',
    fontSize: 12,
  },
});

export default UserHome;