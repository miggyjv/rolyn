import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  read_status: boolean;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    // Set up real-time subscription
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { error } = await supabase.from("messages").insert({
        conversation_id: id,
        sender_id: session.session.user.id,
        message_text: newMessage.trim(),
        read_status: false,
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 8,
                marginVertical: 4,
                marginHorizontal: 8,
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
              }}
            >
              <Text>{item.message_text}</Text>
            </View>
          )}
        />
        <View
          style={{
            flexDirection: "row",
            padding: 8,
            borderTopWidth: 1,
            borderTopColor: "#eee",
          }}
        >
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 20,
              backgroundColor: "#f0f0f0",
              marginRight: 8,
            }}
          />
          <Text
            onPress={sendMessage}
            style={{
              padding: 8,
              backgroundColor: "#007AFF",
              borderRadius: 20,
              color: "white",
            }}
          >
            Send
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
