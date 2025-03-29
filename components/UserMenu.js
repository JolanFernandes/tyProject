import React, { useState } from 'react';
import { View, Text,TextInput, Platform, Button, ScrollView,Linking, Image, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { signOut } from 'firebase/auth';

const UserMenu = ({ handleLogout, navigation }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      handleLogout();
    } catch (error) {
      console.error('Sign out error:', error.message);
    }
  };
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const buttons = [
    { title: 'PLANTS', screen: 'ProductList' },
    { title: 'SEEDS & POTS', screen: 'Seeds' },
    { title: 'SERVICES', screen: 'Services' },
    { title: 'REMINDERS', screen: 'Reminder' },
    
  ];
  
 

  const openWhatsApp = () => {
    const phoneNumber = '+918830318137'; // Replace with actual number
    const message = 'Hello! , I had a Query to be answered...';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigation.navigate("ProductList", { query: searchQuery.trim() });
      setSearchQuery(""); // Reset search input
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => setShowSearchInput(prev => !prev)}>
          <Icon name="search" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Menu</Text>
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
      )}

      {/* Content Area */}
      <View style={styles.content}>
        {buttons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => navigation.navigate(button.screen)}
          >
            <Text style={styles.buttonText}>{button.title}</Text>
            <Icon name="arrow-forward" size={35} color="black" />
          </TouchableOpacity>
        ))}

         <TouchableOpacity
            style={styles.button}
            onPress={openWhatsApp}
          >
            <Text style={{ fontSize: 18, fontWeight: 'thin' }}> Chat with expert</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
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
  button: {
    padding: 12,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
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

export default UserMenu;