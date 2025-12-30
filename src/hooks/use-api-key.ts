import { useState, useEffect, useCallback } from 'react';
import { apiKeyManager, ApiKeyData, UsageStats, CreateKeyRequest } from '@/lib/api-key-manager';
import { useToast } from '@/hooks/use-toast';

interface UseApiKeyReturn {
  apiKey: ApiKeyData | null;
  isLoading: boolean;
  error: string | null;
  usageStats: UsageStats | null;
  createApiKey: (request: CreateKeyRequest) => Promise<void>;
  regenerateKey: (email: string) => Promise<void>;
  deactivateKey: (keyId: string) => Promise<void>;
  refreshUsageStats: () => Promise<void>;
  clearError: () => void;
}

export const useApiKey = (initialKey?: string): UseApiKeyReturn => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  // Load initial API key
  useEffect(() => {
    const loadApiKey = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let keyData: ApiKeyData | null = null;

        if (initialKey) {
          // Use provided key
          keyData = await apiKeyManager.getApiKey(initialKey);
        } else {
          // Try to get from local storage
          keyData = apiKeyManager.getStoredApiKey();
          
          // If found in storage, validate it's still active
          if (keyData) {
            const freshData = await apiKeyManager.getApiKey(keyData.api_key);
            if (freshData) {
              keyData = freshData;
              apiKeyManager.storeApiKeyLocally(freshData);
            } else {
              // Key no longer exists in database
              apiKeyManager.clearStoredApiKey();
              keyData = null;
            }
          }
        }

        setApiKey(keyData);
        
        // Load usage stats if key exists
        if (keyData) {
          await refreshUsageStats();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load API key';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKey();
  }, [initialKey, toast]);

  // Create new API key
  const createApiKey = useCallback(async (request: CreateKeyRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const newKey = await apiKeyManager.createApiKey(request);
      setApiKey(newKey);
      apiKeyManager.storeApiKeyLocally(newKey);
      
      // Load usage stats for new key
      await refreshUsageStats();

      toast({
        title: "Success",
        description: "API key created successfully!",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create API key';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Regenerate API key
  const regenerateKey = useCallback(async (email: string) => {
    if (!email) {
      const errorMessage = "Email is required to regenerate API key";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newKey = await apiKeyManager.regenerateApiKey(email);
      setApiKey(newKey);
      apiKeyManager.storeApiKeyLocally(newKey);
      
      // Load usage stats for new key
      await refreshUsageStats();

      toast({
        title: "Success",
        description: "API key regenerated successfully! Old key has been invalidated.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate API key';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Deactivate API key
  const deactivateKey = useCallback(async (keyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiKeyManager.deactivateApiKey(keyId);
      
      // Update local state
      if (apiKey && apiKey.id === keyId) {
        setApiKey({ ...apiKey, is_active: false });
        apiKeyManager.clearStoredApiKey();
      }

      toast({
        title: "Success",
        description: "API key deactivated successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate API key';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, toast]);

  // Refresh usage statistics
  const refreshUsageStats = useCallback(async () => {
    if (!apiKey) return;

    try {
      const stats = await apiKeyManager.getUsageStats(apiKey.api_key);
      setUsageStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch usage stats';
      console.error('Failed to refresh usage stats:', errorMessage);
      // Don't show toast for usage stats errors as it's not critical
    }
  }, [apiKey]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    apiKey,
    isLoading,
    error,
    usageStats,
    createApiKey,
    regenerateKey,
    deactivateKey,
    refreshUsageStats,
    clearError,
  };
};
