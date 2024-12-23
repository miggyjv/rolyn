import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import RecCards from '@/components/RecCards';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Professional {
  id: string;
  user_id: string;
  created_at: string;
  title?: string;
  description?: string;
  image?: string;
  position?: string;
  skills?: string[];
  distance?: number;
  start_date?: string;
}

interface FetchPostsResponse {
  data: Professional[] | null;
  error: Error | null;
}

export default function Dashboard() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  const fetchUserPosts = useCallback(async (): Promise<FetchPostsResponse> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { data: null, error: new Error('No session found') };

      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }, []);

  const handleFetchPosts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await fetchUserPosts();
    
    if (error) {
      console.error('Error fetching professionals:', error);
      // Here you might want to use a proper error logging service like Sentry
      return;
    }
    
    if (data) setProfessionals(data);
    setIsLoading(false);
  }, [fetchUserPosts]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await handleFetchPosts();
    setIsRefreshing(false);
  }, [handleFetchPosts]);

  useEffect(() => {
    handleFetchPosts();
  }, [handleFetchPosts]);

  const renderContent = () => {
    if (isLoading) return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </View>
    );

    if (professionals.length === 0) return (
      <View style={styles.centerContainer}>
        <Text 
          style={[styles.emptyText, colorScheme === 'dark' && styles.darkText]}
          accessibilityRole="text"
        >
          No posts yet. Create your first post to get started!
        </Text>
      </View>
    );

    return (
      <RecCards 
        cardData={professionals} 
        title="My Posts" 
        vertical={true}
      />
    );
  };

  return (
    <SafeAreaView 
      edges={['right', 'left']} 
      style={[styles.safeArea, colorScheme === 'dark' && styles.darkMode]}
    >
      <View 
        style={[styles.header, { width }]}
        accessibilityRole="header"
      >
        <Text 
          style={[styles.headerTitle, colorScheme === 'dark' && styles.darkText]}
          accessibilityRole="header"
        >
          Dashboard
        </Text>
      </View>
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            accessibilityLabel="Pull to refresh content"
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkMode: {
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    padding: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
  },
  darkText: {
    color: '#E2E8F0',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 