import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Grid3x3, List, Settings, LogOut, Trash2 } from 'lucide-react-native';
import { api, Post } from '@/services/api';

const PLACEHOLDER_IMAGE = 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
const { width } = Dimensions.get('window');
const imageSize = (width - 4) / 3;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadMyPosts();
  }, []);

  async function loadMyPosts() {
    try {
      setLoading(true);
      const posts = await api.getMyPosts();
      setMyPosts(posts || []);
    } catch (error) {
      console.error('Error loading my posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadMyPosts();
  }

  async function handleDeletePost(postId: string) {
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
              setMyPosts(prev => prev.filter(post => post.id !== postId));
              Alert.alert('Sucesso', 'Post excluído com sucesso');
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir post');
            }
          },
        },
      ]
    );
  }

  async function handleLogout() {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{user?.name || 'Usuario'}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Settings size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
            <LogOut size={24} color="#262626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.profileInfo}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myPosts.length}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>seguidores</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>seguindo</Text>
              </View>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.displayName}>{user?.name}</Text>
            <Text style={styles.bioText}>{user?.email}</Text>
          </View>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'grid' && styles.tabActive]}
            onPress={() => setActiveTab('grid')}
          >
            <Grid3x3 size={24} color={activeTab === 'grid' ? '#262626' : '#8e8e8e'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'list' && styles.tabActive]}
            onPress={() => setActiveTab('list')}
          >
            <List size={24} color={activeTab === 'list' ? '#262626' : '#8e8e8e'} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0095f6" />
          </View>
        ) : myPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ainda não há publicações</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/create-post')}
            >
              <Text style={styles.createButtonText}>Criar Primeira Publicação</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'grid' ? (
          <View style={styles.gridContainer}>
            {myPosts.map((post) => (
              <View key={post.id} style={styles.gridItem}>
                <Image
                  source={{ uri: post.photoUrl || PLACEHOLDER_IMAGE }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deleteIconButton}
                  onPress={() => handleDeletePost(post.id)}
                >
                  <View style={styles.deleteIconContainer}>
                    <Trash2 size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {myPosts.map((post) => (
              <View key={post.id} style={styles.listItem}>
                <Image
                  source={{ uri: post.photoUrl || PLACEHOLDER_IMAGE }}
                  style={styles.listImage}
                  resizeMode="cover"
                />
                <View style={styles.listContent}>
                  <Text style={styles.listTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={styles.listText} numberOfLines={2}>{post.content}</Text>
                  <Text style={styles.listDate}>
                    {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.listDeleteButton}
                  onPress={() => handleDeletePost(post.id)}
                >
                  <Trash2 size={20} color="#ed4956" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 28,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '600',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
  statLabel: {
    fontSize: 13,
    color: '#262626',
    marginTop: 2,
  },
  bioSection: {
    marginBottom: 12,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  bioText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
  },
  editProfileButton: {
    backgroundColor: '#efefef',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#262626',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 64,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e8e',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  deleteIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  deleteIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 4,
  },
  listText: {
    fontSize: 13,
    color: '#8e8e8e',
    lineHeight: 18,
    marginBottom: 4,
  },
  listDate: {
    fontSize: 11,
    color: '#8e8e8e',
  },
  listDeleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
});
