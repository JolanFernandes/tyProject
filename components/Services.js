import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const GardeningServices = () => {
  const services = [
    { id: "1", name: "Lawn Mowing" },
    { id: "2", name: "Weeding" },
    { id: "3", name: "Planting" },
    { id: "4", name: "Garden Cleanup" },
  ];

  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handle date selection
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle time selection
  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  // Handle booking
  const onBookService = () => {
    if (!selectedService) {
      Alert.alert("Error", "Please select a service");
      return;
    }

    Alert.alert(
      "Booking Confirmed",
      `You have booked "${selectedService.name}" on ${date.toDateString()} at ${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gardening Services</Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.serviceItem, selectedService?.id === item.id && styles.selectedService]}
            onPress={() => setSelectedService(item)}
          >
            <Text style={styles.serviceText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Date Picker Button */}
      <TouchableOpacity style={styles.dateTimePickerButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateTimeText}>📅 Date: {date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="spinner" onChange={onChangeDate} />
      )}

      {/* Time Picker Button */}
      <TouchableOpacity style={styles.dateTimePickerButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.dateTimeText}>⏰ Time: {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker value={time} mode="time" is24Hour={false} display="spinner" onChange={onChangeTime} />
      )}

      {/* Book Button */}
      <TouchableOpacity style={styles.bookButton} onPress={onBookService}>
        <Text style={styles.bookText}>Book Service</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  serviceItem: {
    padding: 15,
    backgroundColor: "#ddd",
    marginVertical: 5,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
  },
  selectedService: {
    backgroundColor: "#4CAF50",
  },
  serviceText: {
    fontSize: 16,
  },
  dateTimePickerButton: {
    padding: 10,
    backgroundColor: "#FFF",
    borderColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    width: "90%",
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 18,
  },
  bookButton: {
    padding: 15,
    backgroundColor: "#FF5722",
    marginTop: 10,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
  },
  bookText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GardeningServices;
