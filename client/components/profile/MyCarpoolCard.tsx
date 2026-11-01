import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Ban,
  Users,
} from "lucide-react";

import type { Carpool } from "@/features/carpools/carpools.types";

export type MyCarpool = Carpool;

type Props = {
  carpool: MyCarpool;
  onEdit: (carpool: MyCarpool) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  cancelling?: boolean;
  deleting?: boolean;
};

export default function MyCarpoolCard({
  carpool,
  onEdit,
  onCancel,
  onDelete,
  cancelling = false,
  deleting = false,
}: Props) {
  const statusStyles = {
    ACTIVE: "bg-teal-50 text-[#009F9F]",
    EXPIRED: "bg-gray-100 text-gray-500",
    CANCELLED: "bg-red-50 text-red-500",
  };

  const departure = new Date(carpool.departureTime);
  const busy = cancelling || deleting;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-xs text-gray-400">YOUR CARPOOL</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            Carpool #{carpool.id.slice(-6)}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[carpool.status]}`}
        >
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

          <div className="flex items-center gap-2">
            <Users size={17} className="text-[#009F9F]" />
            <span className="text-xs text-gray-600">
              {carpool.requiredPeople} required people
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onEdit(carpool)}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#009F9F] py-3 text-sm font-semibold text-white transition hover:bg-[#008888] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(carpool.id)}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Ban size={16} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {carpool.status === "ACTIVE" && (
          <button
            type="button"
            onClick={() => onCancel(carpool.id)}
            disabled={busy}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Ban size={16} />
            {cancelling ? "Cancelling..." : "Cancel Carpool"}
          </button>
        )}
      </div>
    </div>
  );
}