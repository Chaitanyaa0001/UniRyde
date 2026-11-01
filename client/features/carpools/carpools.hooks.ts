"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./carpools.api";
import type { CreateCarpoolPayload, Carpool } from "./carpools.types";

export const CARPOOLS_QUERY_KEY = ["carpools"] as const;
export const CREATED_CARPOOLS_QUERY_KEY = ["carpools", "created"] as const;

const LIVE_REFRESH_INTERVAL = 3000;

export function useCreateCarpool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCarpoolPayload) =>
      api.createCarpool(payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CARPOOLS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: CREATED_CARPOOLS_QUERY_KEY,
        }),
      ]);
    },
  });
}

export function useDeleteCarpool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpoolId: string) => api.deleteCarpool(carpoolId),

    onSuccess: async (_, carpoolId) => {
      // Remove the deleted carpool from the profile immediately.
      queryClient.setQueryData<{ carpools: Carpool[] }>(
        CREATED_CARPOOLS_QUERY_KEY,
        (old) =>
          old
            ? {
                ...old,
                carpools: old.carpools.filter(
                  (carpool) => carpool.id !== carpoolId,
                ),
              }
            : old,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CARPOOLS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: CREATED_CARPOOLS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", "joined"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", "my-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", carpoolId],
        }),
      ]);
    },
  });
}

export function useUpdateCarpool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carpoolId,
      payload,
    }: {
      carpoolId: string;
      payload: Partial<CreateCarpoolPayload>;
    }) => api.updateCarpool(carpoolId, payload),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CARPOOLS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: CREATED_CARPOOLS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", "joined"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", variables.carpoolId],
        }),
      ]);
    },
  });
}

export function useCancelCarpool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpoolId: string) => api.cancelCarpool(carpoolId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CARPOOLS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: CREATED_CARPOOLS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", "joined"],
        }),
      ]);
    },
  });
}

export function useRequestToJoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carpoolId: string) => api.requestToJoin(carpoolId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CARPOOLS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", "my-requests"],
        }),
      ]);
    },
  });
}

export function useCarpools(search: string) {
  return useQuery({
    queryKey: [...CARPOOLS_QUERY_KEY, search],
    queryFn: () => api.getCarpools(search),
    refetchInterval: LIVE_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useCreatedCarpools() {
  return useQuery({
    queryKey: CREATED_CARPOOLS_QUERY_KEY,
    queryFn: api.getMyCreatedCarpools,
    refetchInterval: LIVE_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useMyRequests() {
  return useQuery({
    queryKey: ["carpools", "my-requests"],
    queryFn: api.getMyRequests,
    refetchInterval: LIVE_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useIncomingRequests(carpoolId: string) {
  return useQuery({
    queryKey: ["carpools", carpoolId, "requests"],
    queryFn: () => api.getIncomingRequests(carpoolId),
    enabled: Boolean(carpoolId),
    refetchInterval: LIVE_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carpoolId,
      requestId,
      action,
    }: {
      carpoolId: string;
      requestId: string;
      action: "ACCEPT" | "REJECT";
    }) => api.updateJoinRequest(carpoolId, requestId, action),

    onSuccess: async (_, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({
          queryKey: CREATED_CARPOOLS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["carpools", variables.carpoolId, "requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: CARPOOLS_QUERY_KEY,
        }),
      ];

      if (variables.action === "ACCEPT") {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: ["carpools", "joined"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["carpools", "my-requests"],
          }),
        );
      }

      await Promise.all(invalidations);
    },
  });
}