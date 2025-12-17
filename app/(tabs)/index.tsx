import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, Post } from '@/services/api';
import { Heart, MessageCircle, Send, Bookmark, MoreVertical, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const PLACEHOLDER_IMAGE = 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

export default function PostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts(page = 1) {
    try {
      setError('');
      if (page === 1) {
        setLoading(true);
      }

      const response = await api.getPosts(page, 10);

      if (response && Array.isArray(response.posts)) {
        if (page === 1) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }
        setCurrentPage(page);
        setTotalPages(Math.ceil((response.count || 0) / 10));
      } else {
        setPosts([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadPosts(1);
  }

  async function handleLoadMore() {
    if (loadingMore || currentPage >= totalPages) return;

    setLoadingMore(true);
    await loadPosts(currentPage + 1);
  }

  async function handleDeletePost(postId: string, postUserId: string) {
    if (user?.id !== Number(postUserId)) {
      Alert.alert('Erro', 'Você só pode excluir seus próprios posts');
      return;
    }

    Alert.alert(
      'Excluir Post',
      'Tem certeza que deseja excluir este post?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePost(postId);
              setPosts(prev => prev.filter(post => post.id !== postId));
              Alert.alert('Sucesso', 'Post excluído com sucesso');
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir post');
            }
          },
        },
      ]
    );
  }

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userId?.toString().charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.username}>Usuário {item.userId}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>
        {user?.id === Number(item.userId) && (
          <TouchableOpacity
            onPress={() => handleDeletePost(item.id, item.userId)}
            style={styles.deleteIcon}
          >
            <Trash2 size={20} color="#262626" />
          </TouchableOpacity>
        )}
      </View>

      <Image
        source={{ uri: item.photoUrl || PLACEHOLDER_IMAGE }}
        style={styles.postImage}
        resizeMode="cover"
      />

      <View style={styles.postActions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Send size={24} color="#262626" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Bookmark size={24} color="#262626" />
        </TouchableOpacity>
      </View>

      <View style={styles.postFooter}>
        <Text style={styles.likesCount}>0 curtidas</Text>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postCaption}>
          <Text style={styles.postUsername}>Usuário {item.userId}</Text>
          <Text style={styles.postText}> {item.content}</Text>
        </Text>
        {item.title && (
          <Text style={styles.postTitle}>{item.title}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Social Feed</Text>
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
        <Text style={styles.headerTitle}>Social Feed</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
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
            <Text style={styles.emptyText}>Nenhum post encontrado</Text>
            <Text style={styles.emptySubtext}>Seja o primeiro a compartilhar algo!</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#262626',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
  },
  postCard: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    paddingVertical: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  timestamp: {
    fontSize: 11,
    color: '#8e8e8e',
  },
  deleteIcon: {
    padding: 8,
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  postCaption: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
  },
  postUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  postTitle: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 4,
  },
  postText: {
    fontSize: 14,
    color: '#262626',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  actionsLeft: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginRight: 12,
  },
  postFooter: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e8e',
  },
});
