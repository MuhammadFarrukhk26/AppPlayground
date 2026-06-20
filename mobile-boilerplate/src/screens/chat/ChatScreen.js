import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../../context/BookingContext';

export default function ChatScreen({ navigation }) {
  const { chatMessages, sendChatMessage, userRole, activeBooking } = useBooking();
  const [text, setText] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    // Smoothly scroll down as soon as chatMessages populate
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendChatMessage(userRole, text);
    setText('');
  };

  // Determine chat header details
  const counterpartName = userRole === 'customer' 
    ? (activeBooking?.provider?.name || 'Ahmed Kamal') 
    : (activeBooking?.customerName || 'Ayesha Khan');

  const counterpartSpecialty = userRole === 'customer'
    ? (activeBooking?.provider?.specialty || 'Electrician Specialist')
    : 'Customer';

  const counterpartAvatar = userRole === 'customer'
    ? (activeBooking?.provider?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80')
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80';

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        {/* Custom Screen Subheader (Contact Details card) */}
        <View style={styles.chatHeader}>
          <Image source={{ uri: counterpartAvatar }} style={styles.headerAvatar} />
          <View style={styles.headerMeta}>
            <Text style={styles.headerName}>{counterpartName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.activeDot} />
              <Text style={styles.headerStatus}>{counterpartSpecialty} • Online</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.callHeaderBtn}
            onPress={() => alert(`Calling ${counterpartName}...`)}
          >
            <Ionicons name="call" size={18} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Scrollable message bubble board */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateTitle}>No messages yet</Text>
              <Text style={styles.emptyStateSub}>Send a message to sync scheduling parameters or coordinates.</Text>
            </View>
          ) : (
            chatMessages.map((msg) => {
              const isMine = msg.sender === userRole;
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isMine ? styles.msgSelfRow : styles.msgOppRow,
                  ]}
                >
                  <View
                    style={[
                      styles.msgBubble,
                      isMine ? styles.bubbleSelf : styles.bubbleOpp,
                    ]}
                  >
                    <Text style={[styles.msgText, isMine ? styles.textSelf : styles.textOpp]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.msgTime, isMine ? styles.timeSelf : styles.timeOpp]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Text Input Row */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type message here..."
            placeholderTextColor="#C7C7CC"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerMeta: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 4,
  },
  headerStatus: {
    fontSize: 11,
    color: '#8E8E93',
  },
  callHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  msgSelfRow: {
    justifyContent: 'flex-end',
  },
  msgOppRow: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleSelf: {
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 4,
  },
  bubbleOpp: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderTopLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 18,
  },
  textSelf: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textOpp: {
    color: '#1C1C1E',
  },
  msgTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeSelf: {
    color: '#FFE5E5',
  },
  timeOpp: {
    color: '#AEAEB2',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 4,
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1C1E',
    marginRight: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#E5E5EA',
  },
});
