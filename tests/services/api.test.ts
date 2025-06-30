import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { apiService } from '../../src/services/api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('API Service', () => {
  beforeEach(() => {
    mockedAxios.create.mockReturnValue({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      defaults: { baseURL: 'http://localhost:3001/api' },
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    });
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      const mockApi = {
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        defaults: { baseURL: 'http://localhost:3001/api' }
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const result = await apiService.login('test@example.com', 'password');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      const mockApi = {
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        defaults: { baseURL: 'http://localhost:3001/api' }
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const result = await apiService.register('test@example.com', 'password', 'Test User');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User'
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Projects', () => {
    it('should fetch projects', async () => {
      const mockResponse = {
        data: {
          projects: [
            { id: '1', title: 'Test Project', latexCode: '\\documentclass{article}' }
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        }
      };

      const mockApi = {
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        defaults: { baseURL: 'http://localhost:3001/api' }
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const result = await apiService.getProjects();

      expect(mockApi.get).toHaveBeenCalledWith('/projects', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should create project', async () => {
      const mockResponse = {
        data: { id: '1', title: 'New Project', latexCode: '' }
      };

      const mockApi = {
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        defaults: { baseURL: 'http://localhost:3001/api' }
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const projectData = { title: 'New Project', description: 'Test description' };
      const result = await apiService.createProject(projectData);

      expect(mockApi.post).toHaveBeenCalledWith('/projects', projectData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('AI Services', () => {
    it('should chat with AI', async () => {
      const mockResponse = {
        data: {
          response: 'AI response',
          model: 'gpt-4',
          tokens: 100
        }
      };

      const mockApi = {
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        defaults: { baseURL: 'http://localhost:3001/api' }
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const result = await apiService.chatWithAI('Hello AI');

      expect(mockApi.post).toHaveBeenCalledWith('/ai/chat', {
        message: 'Hello AI',
        context: undefined,
        projectId: undefined
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should explain LaTeX code', async () => {
      const mockResponse = {
        data: { explanation: 'This is a LaTeX document class declaration.' }
      };

      const mockApi = {
        post: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        defaults: { baseURL: 'http://localhost:3001/api' }
      };

      mockedAxios.create.mockReturnValue(mockApi);

      const result = await apiService.explainLatex('\\documentclass{article}');

      expect(mockApi.post).toHaveBeenCalledWith('/ai/explain', {
        latexCode: '\\documentclass{article}',
        projectId: undefined
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});