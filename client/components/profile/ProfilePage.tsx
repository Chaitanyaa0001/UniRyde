"use client";

import { useState } from "react";
import { CarFront, Mail } from "lucide-react";

import Sidebar from "../SideBar";
import MyCarpoolCard from "./MyCarpoolCard";
import CarpoolForm, {
  type CarpoolFormData,
} from "../carpools/CarpoolForm";

import { useAuth } from "@/context/auth/auth.context";
import {
  useCreatedCarpools,
  useUpdateCarpool,
  useCancelCarpool,
  useDeleteCarpool,
} from "@/features/carpools/carpools.hooks";

import type { Carpool } from "@/features/carpools/carpools.types";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  const carpools = useCreatedCarpools();
  const updateMutation = useUpdateCarpool();
  const cancelMutation = useCancelCarpool();
  const deleteMutation = useDeleteCarpool();

  const [editingCarpool, setEditingCarpool] = useState<Carpool | null>(null);
  const [actionError, setActionError] = useState("");

  const items = carpools.data?.carpools ?? [];
  const activeCount = items.filter(
    (item) => item.status === "ACTIVE",
  ).length;

  const handleEdit = (carpool: Carpool) => {
    setActionError("");
    setEditingCarpool(carpool);
  };

  const handleUpdate = async (data: CarpoolFormData) => {
    if (!editingCarpool) return;

    setActionError("");

    try {
      await updateMutation.mutateAsync({
        carpoolId: editingCarpool.id,
        payload: data,
      });

      setEditingCarpool(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to update carpool.",
      );
    }
  };

  const handleCancel = async (carpoolId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this carpool? It will remain in your profile.",
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await cancelMutation.mutateAsync(carpoolId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to cancel carpool.",
      );
    }
  };

  const handleDelete = async (carpoolId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this carpool? This action cannot be undone.",
    );

    if (!confirmed) return;

    setActionError("");

    try {
      await deleteMutation.mutateAsync(carpoolId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete carpool.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA]">
      <Sidebar />

      <main className="min-h-screen pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[90px] items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <p className="text-sm text-gray-400">UniRyde / Profile</p>
            <h1 className="text-lg font-semibold text-gray-800">
              My Profile
            </h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 font-semibold text-[#009F9F]">
            {user?.username?.charAt(0).toUpperCase() ?? "U"}
          </div>
        </header>

        <div className="p-8">
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-7">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-3xl font-bold text-[#009F9F]">
                {user?.username?.charAt(0).toUpperCase() ?? "U"}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading ? "Loading..." : user?.username}
                </h2>
                <p className="mt-1 text-sm text-gray-500">UniRyde Member</p>
              </div>
            </div>

            <div className="mt-7 border-t border-gray-100 pt-6">
              <div className="flex items-start gap-3">
                <Mail size={19} className="mt-1 text-[#009F9F]" />
                <div>
                  <p className="text-xs text-gray-400">EMAIL ADDRESS</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900">My Carpools</h2>
            <p className="mt-2 text-sm text-gray-500">
              Manage the carpools you have created.
            </p>
          </div>

          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Total Carpools</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {items.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Active Carpools</p>
              <p className="mt-2 text-3xl font-bold text-[#009F9F]">
                {activeCount}
              </p>
            </div>
          </div>

          {actionError && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              {actionError}
            </p>
          )}

          {carpools.isLoading ? (
            <p className="text-sm text-gray-500">Loading carpools...</p>
          ) : carpools.isError ? (
            <p className="text-sm text-red-500">{carpools.error.message}</p>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
              {items.map((carpool) => (
                <MyCarpoolCard
                  key={carpool.id}
                  carpool={carpool}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  cancelling={cancelMutation.isPending}
                  deleting={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <CarFront size={35} className="mb-4 text-[#009F9F]" />
              <h3 className="text-lg font-semibold text-gray-800">
                No carpools yet
              </h3>
            </div>
          )}
        </div>
      </main>

      {editingCarpool && (
        <CarpoolForm
          carpool={editingCarpool}
          onClose={() => {
            if (!updateMutation.isPending) setEditingCarpool(null);
          }}
          onSubmit={handleUpdate}
          submitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}