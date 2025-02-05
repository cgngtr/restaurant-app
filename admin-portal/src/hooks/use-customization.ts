import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCustomizationGroupTypes,
  createCustomizationGroupType,
  updateCustomizationGroupType,
  deleteCustomizationGroupType,
  getCustomizationGroups,
  createCustomizationGroup,
  updateCustomizationGroup,
  deleteCustomizationGroup,
  createCustomizationOption,
  updateCustomizationOption,
  deleteCustomizationOption,
  addCustomizationToMenuItem,
  removeCustomizationFromMenuItem,
  updateCustomizationSortOrder,
  type CustomizationGroupType,
  type CustomizationGroup,
  type CustomizationOption,
} from '@/lib/api/customization';

// Group Types
export function useCustomizationGroupTypes(restaurantId: string) {
  return useQuery({
    queryKey: ['customization-group-types', restaurantId],
    queryFn: () => getCustomizationGroupTypes(restaurantId),
  });
}

export function useCreateCustomizationGroupType(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CustomizationGroupType, 'id' | 'restaurant_id'>) =>
      createCustomizationGroupType(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-group-types', restaurantId],
      });
    },
  });
}

export function useUpdateCustomizationGroupType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<CustomizationGroupType, 'id' | 'restaurant_id'>>;
    }) => updateCustomizationGroupType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['customization-group-types'],
      });
    },
  });
}

export function useDeleteCustomizationGroupType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomizationGroupType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-group-types'],
      });
    },
  });
}

// Groups
export function useCustomizationGroups(restaurantId: string) {
  return useQuery({
    queryKey: ['customization-groups', restaurantId],
    queryFn: () => getCustomizationGroups(restaurantId),
  });
}

export function useCreateCustomizationGroup(restaurantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CustomizationGroup, 'id' | 'restaurant_id'>) =>
      createCustomizationGroup(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-groups', restaurantId],
      });
    },
  });
}

export function useUpdateCustomizationGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<CustomizationGroup, 'id' | 'restaurant_id'>>;
    }) => updateCustomizationGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-groups'],
      });
    },
  });
}

export function useDeleteCustomizationGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomizationGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-groups'],
      });
    },
  });
}

// Options
export function useCreateCustomizationOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CustomizationOption, 'id'>) =>
      createCustomizationOption(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-groups'],
      });
    },
  });
}

export function useUpdateCustomizationOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<CustomizationOption, 'id' | 'group_id'>>;
    }) => updateCustomizationOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-groups'],
      });
    },
  });
}

export function useDeleteCustomizationOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomizationOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-groups'],
      });
    },
  });
}

// Menu Item Customizations
export function useAddCustomizationToMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      menuItemId,
      groupId,
      sortOrder,
    }: {
      menuItemId: string;
      groupId: string;
      sortOrder?: number;
    }) => addCustomizationToMenuItem(menuItemId, groupId, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['menu-items'],
      });
    },
  });
}

export function useRemoveCustomizationFromMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      menuItemId,
      groupId,
    }: {
      menuItemId: string;
      groupId: string;
    }) => removeCustomizationFromMenuItem(menuItemId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['menu-items'],
      });
    },
  });
}

export function useUpdateCustomizationSortOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      menuItemId,
      groupId,
      sortOrder,
    }: {
      menuItemId: string;
      groupId: string;
      sortOrder: number;
    }) => updateCustomizationSortOrder(menuItemId, groupId, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['menu-items'],
      });
    },
  });
} 