'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { spkAPI } from '@/services/api';

// Types for SPK with pagination
interface SpkPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filterField?: string;
  filterValue?: string;
  startDate?: string;
  endDate?: string;
}

interface SpkPaginationResponse {
  data: any[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface UseSpkDataResult {
  spks: any[];
  loading: boolean;
  error: unknown;
  refetch: () => void;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (field: string, order: 'asc' | 'desc') => void;
  setFilter: (field: string, value: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  updateSpk: (id: string, data: any) => Promise<void>;
  isUpdating: boolean;
}

export function useSpkData(params: SpkPaginationParams = {}): UseSpkDataResult {
  const queryClient = useQueryClient();

  // Build query key for caching and invalidation
  const queryKey = ['spks', params];

  // Fetch SPK data with server-side pagination, filtering, and sorting
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      // Calculate date filter (default to last 2 months if not provided)
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const defaultStartDate = twoMonthsAgo.toISOString().split('T')[0];

      const apiParams: any = {
        sort: {},
        populate: {
          salesProfile: {
            fields: ['id', 'documentId', 'surename', 'namasupervisor', 'email', 'phonenumber', 'city', 'address'],
          },
          detailInfo: true,
          unitInfo: {
            populate: {
              vehicleType: {
                fields: ['name'],
              },
              color: {
                fields: ['colorname'],
              },
            },
          },
          ktpPaspor: true,
          kartuKeluarga: true,
          selfie: true,
        },
      };

      // Pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 25;
      apiParams['pagination[page]'] = page;
      apiParams['pagination[pageSize]'] = pageSize;
      apiParams['pagination[start]'] = (page - 1) * pageSize;

      // Sorting (server-side)
      if (params.sortField) {
        const sortOrder = params.sortOrder || 'desc';
        apiParams.sort[`sort[${params.sortField}]`] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        apiParams.sort['sort[createdAt]'] = 'desc'; // Default sort
      }

      // Filtering by date range
      const startDate = params.startDate || defaultStartDate;
      const endDate = params.endDate || new Date().toISOString().split('T')[0];
      apiParams.filters = {
        tanggal: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      // Additional field filter
      if (params.filterField && params.filterValue) {
        apiParams.filters[params.filterField] = {
          $containsi: params.filterValue,
        };
      }

      const response = await spkAPI.find(apiParams);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache duration
  });

  // Extract data and pagination info
  const spks = data?.data || [];
  const pagination = {
    page: data?.meta?.pagination?.page || params.page || 1,
    pageSize: data?.meta?.pagination?.pageSize || params.pageSize || 25,
    pageCount: data?.meta?.pagination?.pageCount || 1,
    total: data?.meta?.pagination?.total || 0,
  };

  // Update SPK mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: string; updateData: any }) => {
      return await spkAPI.update(id, updateData);
    },
    onSuccess: () => {
      // Invalidate and refetch SPK data
      queryClient.invalidateQueries({ queryKey: ['spks'] });
      toast.success('SPK updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update SPK:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update SPK');
    },
  });

  const setPage = (page: number) => {
    // This will trigger a re-fetch with new params
    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      page,
    }));
  };

  const setPageSize = (pageSize: number) => {
    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      pageSize,
      page: 1, // Reset to first page when changing page size
    }));
  };

  const setSort = (field: string, order: 'asc' | 'desc') => {
    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      sortField: field,
      sortOrder: order,
      page: 1, // Reset to first page when sorting
    }));
  };

  const setFilter = (field: string, value: string) => {
    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      filterField: field,
      filterValue: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const setDateRange = (startDate: string, endDate: string) => {
    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      startDate,
      endDate,
      page: 1, // Reset to first page when changing date range
    }));
  };

  const updateSpk = async (id: string, updateData: any) => {
    await updateMutation.mutateAsync({ id, updateData });
  };

  return {
    spks,
    loading: isLoading,
    error,
    refetch,
    pagination,
    setPage,
    setPageSize,
    setSort,
    setFilter,
    setDateRange,
    updateSpk,
    isUpdating: updateMutation.isPending,
  };
}
