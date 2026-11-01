"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import type { Carpool } from "@/features/carpools/carpools.types";

type Props = {
  carpool: Carpool;
  currentUserId: string;
  onJoin?: (id: string) => void;
  joining?: boolean;
  onEdit?: (carpool: Carpool) => void;
  onCancel?: (carpool: Carpool) => void;
  cancelling?: boolean;
};

export default function CarpoolCard({
  carpool,
  currentUserId,
  onJoin,
  joining,
  onEdit,
  onCancel,
  cancelling,
}: Props) {
  const departure = new Date(carpool.departureTime);
  const isOwner = carpool.userId === currentUserId;
  const requestStatus = carpool.currentUserRequest?.status;

  const cannotRequest =
    isOwner || (requestStatus !== undefined && requestStatus !== null);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {carpool.user.username}
          </p>
          <p className="text-xs text-gray-400">Carpool creator</p>
        </div>

        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#009F9F]">
          {carpool.status}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-5 flex gap-4">
          <div className="flex flex-col items-center pt-1">
            <div className="h-3 w-3 rounded-full border-[3px] border-[#009F9F]" />
            <div className="my-1 h-10 border-l-2 border-dashed border-gray-300" />
            <MapPin size={17} className="text-[#009F9F]" />
          </div>

          <div className="flex-1 space-y-5">
            <div>
              <p className="mb-1 text-xs text-gray-400">PICKUP POINT</p>
              <p className="text-sm font-semibold text-gray-800">
                {carpool.pickupPoint}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-400">DESTINATION</p>
              <p className="text-sm font-semibold text-gray-800">
                {carpool.destinationPoint}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={17} className="text-[#009F9F]" />
            <span className="text-xs text-gray-600">
              {departure.toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={17} className="text-[#009F9F]" />
            <span className="text-xs text-gray-600">
              {departure.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <Users size={17} className="text-[#009F9F]" />
            <span className="text-xs text-gray-600">
              {carpool.availableSeats} seats available
            </span>
          </div>
        </div>

        {isOwner ? (
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => onEdit?.(carpool)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#009F9F] py-3 text-sm font-semibold text-[#009F9F] transition hover:bg-teal-50"
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              type="button"
              disabled={cancelling}
              onClick={() => onCancel?.(carpool)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          </div>
        ) : (
          <button
            disabled={
              joining || cannotRequest || carpool.availableSeats < 1
            }
            onClick={() => onJoin?.(carpool.id)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#009F9F] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {joining
              ? "Sending..."
              : requestStatus === "PENDING"
                ? "Request pending"
                : requestStatus === "ACCEPTED"
                  ? "Already accepted"
                  : requestStatus === "REJECTED"
                    ? "Request rejected"
                    : "Request to Join"}

            {!cannotRequest && <ArrowRight size={17} />}
          </button>
        )}
      </div>
    </div>
  );
}