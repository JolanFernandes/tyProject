import React, { createContext, useContext, useState } from 'react';
import Toast from 'react-native-toast-message'; // Import Toast


const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children,navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const calculateTotal = (items) => {
    const orderValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = 30;
    setTotal(orderValue + delivery);
  };

  const addToCart = (newItem) => {
    const existingItemIndex = cartItems.findIndex(item => item.id === newItem.id);
    let updatedCartItems;

    if (existingItemIndex > -1) {
      updatedCartItems = cartItems.map((item, index) =>
        index === existingItemIndex && item.quantity < 10 ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCartItems = [...cartItems, { ...newItem, quantity: 1 }];
    }

    setCartItems(updatedCartItems);
    calculateTotal(updatedCartItems);
  };

  const handleDelete = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const decrementQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      const updatedItems = cartItems.map(cartItem =>
        cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } else if (item) {
      handleDelete(itemId);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, total, addToCart, handleDelete, setCartItems, decrementQuantity }}>
      {children}
    </CartContext.Provider>
  );
};