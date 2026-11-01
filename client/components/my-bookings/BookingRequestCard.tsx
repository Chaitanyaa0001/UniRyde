
"use client";

import { useState } from "react";
import {
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Check,
  X,
  UserRound,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

export type BookingRequest = {
  id: string;
  username: string;
  profilePhotoUrl?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  conversationId?: string | null;
};

export type BookingCarpool = {
  id: string;
  pickupPoint: string;
  destinationPoint: string;
  departureTime: string;
  requiredPeople: number;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  requests: BookingRequest[];
};

type Props = {
  carpool: BookingCarpool;
  onRequestAction: (
    carpoolId: string,
    requestId: string,
    action: "ACCEPT" | "REJECT"
  ) => Promise<{ conversationId?: string }>;
  onOpenChat: (conversationId: string, username: string) => void;
};

export default function BookingRequestCard({
  carpool,
  onRequestAction,
  onOpenChat,
}: Props) {
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const departure = new Date(carpool.departureTime);

  const pendingCount = carpool.requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const statusStyles = {
    PENDING: "bg-amber-50 text-amber-600",
    ACCEPTED: "bg-teal-50 text-[#009F9F]",
    REJECTED: "bg-red-50 text-red-500",
  };

  const handleRequestAction = async (
    request: BookingRequest,
    action: "ACCEPT" | "REJECT"
  ) => {
    if (processingRequestId) return;

    setProcessingRequestId(request.id);
    setActionError(null);

    try {
      const result = await onRequestAction(
        carpool.id,
        request.id,
        action
      );

      if (action === "ACCEPT" && result.conversationId) {
        onOpenChat(result.conversationId, request.username);
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to process this request. Please try again."
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-xs font-medium text-gray-400">YOUR CARPOOL</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            Carpool #{carpool.id.slice(-6)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#009F9F]">
            {carpool.status}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      <div className="border-b border-gray-100 p-5">
        <div className="flex gap-4">
          <div className="flex flex-col items-center pt-1">
            <div className="h-3 w-3 rounded-full border-[3px] border-[#009F9F]" />
            <div className="my-1 h-9 border-l-2 border-dashed border-gray-300" />
            <MapPin size={17} className="text-[#009F9F]" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-400">PICKUP POINT</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {carpool.pickupPoint}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">DESTINATION</p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {carpool.destinationPoint}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#009F9F]" />
            <span className="text-xs text-gray-600">
              {departure.toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#009F9F]" />
            <span className="text-xs text-gray-600">
              {departure.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <Users size={16} className="text-[#009F9F]" />
            <span className="text-xs text-gray-600">
              {carpool.requiredPeople} required people
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Booking Requests</h3>
          <span className="text-xs text-gray-400">
            {carpool.requests.length} requests
          </span>
        </div>

        {actionError && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {actionError}
          </p>
        )}

        {carpool.requests.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
            No booking requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {carpool.requests.map((request) => {
              const isProcessing = processingRequestId === request.id;
              const isBusy = processingRequestId !== null;

              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {request.profilePhotoUrl ? (
                        <Image
                          src={request.profilePhotoUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-[#009F9F]">
                          <UserRound size={19} />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {request.username}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[request.status]}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  {request.status === "PENDING" && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRequestAction(request, "ACCEPT")}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#009F9F] py-2.5 text-sm font-semibold text-white transition hover:bg-[#008888] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={16} />
                        {isProcessing ? "Processing..." : "Accept"}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRequestAction(request, "REJECT")}
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  )}

                  {request.status === "ACCEPTED" &&
                    request.conversationId && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenChat(
                            request.conversationId!,
                            request.username
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-50 py-2.5 text-sm font-semibold text-[#009F9F] transition hover:bg-teal-100"
                      >
                        <MessageCircle size={17} />
                        Open Chat
                      </button>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
