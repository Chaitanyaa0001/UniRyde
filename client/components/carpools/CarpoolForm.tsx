"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import type { Carpool } from "@/features/carpools/carpools.types";

export type CarpoolFormData = {
  pickupPoint: string;
  destinationPoint: string;
  departureTime: string;
  requiredPeople: number;
};

type Props = {
  onClose: () => void;
  onSubmit: (data: CarpoolFormData) => void | Promise<void>;
  carpool?: Carpool | null;
  submitting?: boolean;
};

const getLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getLocalTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

export default function CarpoolForm({
  onClose,
  onSubmit,
  carpool,
  submitting = false,
}: Props) {
  const editing = Boolean(carpool);

  const [form, setForm] = useState({
    pickupPoint: "",
    destinationPoint: "",
    departureDate: "",
    departureTime: "",
    requiredPeople: "2",
  });

  useEffect(() => {
    if (!carpool) return;

    const departure = new Date(carpool.departureTime);

    setForm({
      pickupPoint: carpool.pickupPoint,
      destinationPoint: carpool.destinationPoint,
      departureDate: getLocalDate(departure),
      departureTime: getLocalTime(departure),
      requiredPeople: String(carpool.requiredPeople),
    });
  }, [carpool]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const departureDateTime = new Date(
      `${form.departureDate}T${form.departureTime}`,
    );

    if (Number.isNaN(departureDateTime.getTime())) return;

    await onSubmit({
      pickupPoint: form.pickupPoint.trim(),
      destinationPoint: form.destinationPoint.trim(),
      departureTime: departureDateTime.toISOString(),
      requiredPeople: Number(form.requiredPeople),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {editing ? "Edit Carpool" : "Post a Carpool"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {editing
                ? "Update your journey details."
                : "Share your journey with fellow students."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close form"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pickup Point
            </label>
            <input
              required
              maxLength={200}
              value={form.pickupPoint}
              onChange={(event) =>
                setForm({ ...form, pickupPoint: event.target.value })
              }
              placeholder="Where will you start?"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#009F9F]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Destination
            </label>
            <input
              required
              maxLength={200}
              value={form.destinationPoint}
              onChange={(event) =>
                setForm({ ...form, destinationPoint: event.target.value })
              }
              placeholder="Where are you going?"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#009F9F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Departure Date
              </label>
              <input
                required
                type="date"
                min={getLocalDate(new Date())}
                value={form.departureDate}
                onChange={(event) =>
                  setForm({ ...form, departureDate: event.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#009F9F]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Departure Time
              </label>
              <input
                required
                type="time"
                value={form.departureTime}
                onChange={(event) =>
                  setForm({ ...form, departureTime: event.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none focus:border-[#009F9F]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Required People (including you)
            </label>
            <input
              required
              type="number"
              min={2}
              max={100}
              value={form.requiredPeople}
              onChange={(event) =>
                setForm({ ...form, requiredPeople: event.target.value })
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#009F9F]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#009F9F] py-3.5 text-sm font-semibold text-white hover:bg-[#008888] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : editing ? (
              <Save size={18} />
            ) : (
              <Plus size={18} />
            )}
            {submitting
              ? editing
                ? "Saving changes..."
                : "Creating..."
              : editing
                ? "Save Changes"
                : "Create Carpool"}
          </button>
        </form>
      </div>
    </div>
  );
}