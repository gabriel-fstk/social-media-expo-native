import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, User } from '@/services/api';
import { UserPlus } from 'lucide-react-native';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers(page = 1) {
    try {
      setError('');
      if (page === 1) {
        setLoading(true);
      }

      const response = await api.getUsers(page, 10);

      if (response && Array.isArray(response.users)) {
        const validUsers = response.users.filter(user => user && user.email);

        if (page === 1) {
          setUsers(validUsers);
        } else {
          setUsers(prev => [...prev, ...validUsers]);
        }
        setCurrentPage(page);
        setTotalPages(Math.ceil((response.count || 0) / 10));
      } else {
        setUsers([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadUsers(1);
  }

  async function handleLoadMore() {
    if (loadingMore || currentPage >= totalPages) return;

    setLoadingMore(true);
    await loadUsers(currentPage + 1);
  }

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.createdAt && (
            <Text style={styles.userDate}>
              Membro desde {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Seguir</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Usuários</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usuários</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item, index) => item.email || `user-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#0095f6" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UserPlus size={48} color="#8e8e8e" />
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    margin: 16,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#8e8e8e',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  followButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e8e',
    marginTop: 16,
  },
});
