import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://simple-api-ngvw.onrender.com';

export interface User {
  id?: number;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  photoUrl: string;
  userId: string;
  createdAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface RegisterResponse {
  message?: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@jwt_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await this.getToken();
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = 'Ocorreu um erro inesperado';
        
        try {
          const errorData = await response.json();
          
          if (errorData.message) {
            const apiMessage = errorData.message.toLowerCase();
            
            if (apiMessage.includes('email already exists') || apiMessage.includes('user with this email')) {
              errorMessage = 'Este e-mail já está cadastrado';
            } else if (apiMessage.includes('invalid credentials') || apiMessage.includes('invalid password')) {
              errorMessage = 'E-mail ou senha incorretos';
            } else if (apiMessage.includes('not found')) {
              errorMessage = 'Item não encontrado';
            } else if (apiMessage.includes('unauthorized')) {
              errorMessage = 'Você não tem permissão para realizar esta ação';
            } else if (apiMessage.includes('token') && apiMessage.includes('expired')) {
              errorMessage = 'Sua sessão expirou. Por favor, faça login novamente';
            } else if (apiMessage.includes('token') && apiMessage.includes('invalid')) {
              errorMessage = 'Sessão inválida. Por favor, faça login novamente';
            } else {
              errorMessage = errorData.message;
            }
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // Se não conseguir ler o erro da API, usa mensagens amigáveis baseadas no status
          switch (response.status) {
            case 400:
              errorMessage = 'Dados inválidos. Verifique as informações e tente novamente';
              break;
            case 401:
              errorMessage = 'E-mail ou senha incorretos';
              break;
            case 403:
              errorMessage = 'Você não tem permissão para realizar esta ação';
              break;
            case 404:
              errorMessage = 'Item não encontrado';
              break;
            case 409:
              errorMessage = 'Este e-mail já está cadastrado';
              break;
            case 422:
              errorMessage = 'Dados inválidos. Verifique as informações fornecidas';
              break;
            case 429:
              errorMessage = 'Muitas tentativas. Aguarde um momento e tente novamente';
              break;
            case 500:
              errorMessage = 'Erro no servidor. Tente novamente em alguns instantes';
              break;
            case 502:
            case 503:
              errorMessage = 'Serviço temporariamente indisponível. Tente novamente em breve';
              break;
            case 504:
              errorMessage = 'Tempo de resposta esgotado. Verifique sua conexão e tente novamente';
              break;
            default:
              errorMessage = 'Ocorreu um erro inesperado. Tente novamente';
          }
        }
        
        throw new Error(errorMessage);
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text);
      } catch {
        return {} as T;
      }
    } catch (error: any) {
      if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
        throw new Error('Sem conexão com a internet. Verifique sua conexão e tente novamente');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('A conexão demorou muito. Verifique sua internet e tente novamente');
      }
      
      throw error;
    }
  }

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    console.log('Register response:', response);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  }

  async getUsers(page: number = 1, limit: number = 10): Promise<{ count: number; users: User[] }> {
    const endpoint = `/users?page=${page}&limit=${limit}`;
    const response = await this.request<{ count: number; users: User[] }>(endpoint);
    return response;
  }

  async getUserById(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async getPosts(page: number = 1, limit: number = 10): Promise<{ posts: Post[]; count: number }> {
    return this.request<{ posts: Post[]; count: number }>(`/posts?page=${page}&limit=${limit}`);
  }

  async getMyPosts(): Promise<Post[]> {
    return this.request<Post[]>('/my-posts');
  }

  async createPost(title: string, content: string, photo: {
    uri: string;
    name: string;
    type: string;
  }): Promise<Post> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('foto', photo as any);

    return this.request<Post>('/posts', {
      method: 'POST',
      body: formData,
    });
  }

  async deletePost(postId: string): Promise<void> {
    console.log('Deleting post:', postId);
    const result = await this.request<void>(`/posts/${postId}`, {
      method: 'DELETE',
    });
    console.log('Delete result:', result);
    return result;
  }

  async healthCheck(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/healthcheck`);
    return await response.text();
  }
}

export const api = new ApiService();
