import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from 'expo-notifications';

const ReminderApp = () => {
  const [title, setTitle] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationTimer, setNotificationTimer] = useState(null);

  const days = [
    { short: "S", full: "Sunday" },
    { short: "M", full: "Monday" },
    { short: "T", full: "Tuesday" },
    { short: "W", full: "Wednesday" },
    { short: "T", full: "Thursday" },
    { short: "F", full: "Friday" },
    { short: "S", full: "Saturday" },
  ];

  // Toggle selected day for reminder
  const toggleDay = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter((day) => day !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  // Handle saving reminder and setting up notification timer
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Alert", "Please enter a title for the reminder.");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("Alert!", "Please select at least one day.");
      return;
    }

    // Display reminder alert
    const selectedDaysNames = selectedDays
      .map((dayIndex) => days[dayIndex].full)
      .join(", ");
    Alert.alert(
      "Reminder Set",
      `Reminder "${title}" was set for ${selectedDaysNames} at ${time.toLocaleTimeString()}`
    );

    // Start checking for the reminder
    startReminderCheck(time, selectedDays);

    // Reset input fields
    setTitle("");
    setSelectedDays([]);
    setTime(new Date());
  };

  // Start reminder check for time match
  const startReminderCheck = (reminderTime, daysArray) => {
    // Clear any existing timer
    if (notificationTimer) {
      clearInterval(notificationTimer);
    }

    // Start checking for reminder time
    const timer = setInterval(() => {
      const currentTime = new Date();
      const currentDayIndex = currentTime.getDay();
      
      // Check if today is a selected reminder day and time matches
      if (daysArray.includes(currentDayIndex) && currentTime.getHours() === reminderTime.getHours() && currentTime.getMinutes() === reminderTime.getMinutes()) {
        sendNotification();
        clearInterval(timer); // Clear the timer after sending the notification
      }
    }, 60000); // Check every 60 seconds

    setNotificationTimer(timer);
  };

  // Send notification
  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: { 
        title, 
        body: 'It\'s time for your reminder!' 
      },
      trigger: null, // Immediate notification
    });

    Alert.alert('Reminder', 'It\'s time for your reminder!');
  };

  // Date/time picker change handler
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || time;
    setShowTimePicker(false);
    setTime(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New Reminder</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.day,
              selectedDays.includes(index) ? styles.selectedDay : null,
            ]}
            onPress={() => toggleDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(index) ? styles.selectedDayText : null,
              ]}
            >
              {day.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.timePickerButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.timeText}>
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={onChange}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
    paddingTop: 180,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 50,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "green",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  selectedDay: {
    backgroundColor: "#4CAF50",
  },
  dayText: {
    fontSize: 16,
    color: "#000",
  },
  selectedDayText: {
    color: "#FFF",
  },
  timePickerButton: {
    padding: 10,
    backgroundColor: "#FFF",
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 25,
  },
  timeText: {
    fontSize: 25,
  },
  saveButton: {
    color: "FFF",
    fontSize: 20,
    fontWeight: "bold",
    borderColor: "green",
    borderWidth: 1,
    padding: 10,
    width: "45%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ReminderApp;
