"use client";

import { useMemo, useState } from "react";
import {
  CarFront,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import Sidebar from "../SideBar";
import CarpoolCard from "./CarpoolCard";
import CarpoolForm, { type CarpoolFormData } from "./CarpoolForm";

import {
  useCarpools,
  useCreateCarpool,
  useRequestToJoin,
  useUpdateCarpool,
  useCancelCarpool,
} from "@/features/carpools/carpools.hooks";

import { useAuth } from "@/context/auth/auth.context";
import type { Carpool } from "@/features/carpools/carpools.types";

export default function CarpoolPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCarpool, setEditingCarpool] = useState<Carpool | null>(null);
  const [actionError, setActionError] = useState("");

  const carpoolsQuery = useCarpools(search);
  const createMutation = useCreateCarpool();
  const updateMutation = useUpdateCarpool();
  const cancelMutation = useCancelCarpool();
  const joinMutation = useRequestToJoin();

  const { user } = useAuth();

  const filteredCarpools = useMemo(() => {
    const carpools = carpoolsQuery.data?.carpools ?? [];
    const query = search.trim().toLowerCase();

    return carpools.filter(
      (carpool) =>
        !query ||
        carpool.pickupPoint.toLowerCase().includes(query) ||
        carpool.destinationPoint.toLowerCase().includes(query) ||
        carpool.user.username.toLowerCase().includes(query),
    );
  }, [carpoolsQuery.data?.carpools, search]);

  const openCreateForm = () => {
    setActionError("");
    setEditingCarpool(null);
    setShowForm(true);
  };

  const openEditForm = (carpool: Carpool) => {
    setActionError("");
    setEditingCarpool(carpool);
    setShowForm(true);
  };

  const closeForm = () => {
    if (createMutation.isPending || updateMutation.isPending) return;

    setShowForm(false);
    setEditingCarpool(null);
  };

  const handleSubmit = async (data: CarpoolFormData) => {
    setActionError("");

    try {
      if (editingCarpool) {
        await updateMutation.mutateAsync({
          carpoolId: editingCarpool.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }

      setShowForm(false);
      setEditingCarpool(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to save carpool.",
      );
    }
  };

  const handleCancel = async (carpool: Carpool) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel this carpool?\n\n${carpool.pickupPoint} → ${carpool.destinationPoint}`,
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await cancelMutation.mutateAsync(carpool.id);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to cancel carpool.",
      );
    }
  };

  const handleJoin = async (carpoolId: string) => {
    setActionError("");

    try {
      await joinMutation.mutateAsync(carpoolId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to request carpool.",
      );
    }
  };

  const formSubmitting =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-[#F7FAFA]">
      <Sidebar />

      <main className="min-h-screen pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[90px] items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <p className="text-sm text-gray-400">UniRyde / Carpools</p>
            <h1 className="text-lg font-semibold text-gray-800">
              Campus Carpooling
            </h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 font-semibold text-[#009F9F]">
            U
          </div>
        </header>

        <div className="p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Find Carpools
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Find students travelling in the same direction as you.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="flex items-center gap-2 rounded-xl bg-[#009F9F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#008888]"
            >
              <Plus size={19} />
              Post Carpool
            </button>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pickup, destination or student..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#009F9F] focus:bg-white"
              />
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600"
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>

          {actionError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {actionError}
            </div>
          )}

          {carpoolsQuery.isLoading && (
            <p className="text-sm text-gray-500">Loading carpools...</p>
          )}

          {carpoolsQuery.isError && (
            <p className="text-sm text-red-500">
              {carpoolsQuery.error.message}
            </p>
          )}

          {!carpoolsQuery.isLoading && !carpoolsQuery.isError && (
            <>
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  Available Carpools
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredCarpools.length} carpools found
                </p>
              </div>

              {filteredCarpools.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
                  {filteredCarpools.map((carpool) => (
                    <CarpoolCard
                      key={carpool.id}
                      carpool={carpool}
                      currentUserId={user?.id ?? ""}
                      onJoin={handleJoin}
                      joining={joinMutation.isPending}
                      onEdit={openEditForm}
                      onCancel={handleCancel}
                      cancelling={cancelMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <CarFront size={30} className="mb-4 text-[#009F9F]" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    No carpools found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Try another search or post a new carpool.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showForm && (
        <CarpoolForm
          carpool={editingCarpool}
          onClose={closeForm}
          onSubmit={handleSubmit}
          submitting={formSubmitting}
        />
      )}
    </div>
  );
}