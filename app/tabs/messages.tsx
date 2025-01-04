import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string;
  updated_at: string;
  unread_count: number;
  participant_1_profile: {
    full_name: string;
    avatar_url: string;
  };
  participant_2_profile: {
    full_name: string;
    avatar_url: string;
  };
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      setCurrentUserId(session.session.user.id);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          participant_1_profile: profiles!conversations_participant_1_fkey(full_name, avatar_url),
          participant_2_profile: profiles!conversations_participant_2_fkey(full_name, avatar_url)
        `
        )
        .or(
          `participant_1.eq.${session.session.user.id},participant_2.eq.${session.session.user.id}`
        )
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const getOtherParticipantName = (conversation: Conversation) => {
    if (currentUserId === conversation.participant_1) {
      return conversation.participant_2_profile?.full_name || "Unknown User";
    }
    return conversation.participant_1_profile?.full_name || "Unknown User";
  };

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="message" size={64} color="#CBD5E0" />
      <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
      <Text style={styles.emptyStateText}>
        Your conversations will appear here once you start chatting with
        employers or workers through job postings.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {conversations.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/chat/${item.id}`} asChild>
              <Pressable style={styles.conversationItem}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getOtherParticipantName(item).charAt(0)}
                  </Text>
                </View>
                <View style={styles.conversationContent}>
                  <Text style={styles.participantName}>
                    {getOtherParticipantName(item)}
                  </Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.last_message || "No messages yet"}
                  </Text>
                </View>
                {item.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{item.unread_count}</Text>
                  </View>
                )}
              </Pressable>
            </Link>
          )}
          contentContainerStyle={
            conversations.length === 0 && styles.emptyListContent
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A202C",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A5568",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginTop: 8,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6B46C1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#718096",
  },
  unreadBadge: {
    backgroundColor: "#6B46C1",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyListContent: {
    flex: 1,
  },
});
