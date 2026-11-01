"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Inbox,
  Search,
  Users,
} from "lucide-react";

import Sidebar from "../SideBar";
import BookingRequestCard, {
  type BookingCarpool,
} from "./BookingRequestCard";

import {
  useCreatedCarpools,
  useUpdateJoinRequest,
} from "@/features/carpools/carpools.hooks";

import { getIncomingRequests } from "@/features/carpools/carpools.api";
import { useMessaging } from "@/components/carpools/chat/MessagingWidget";

export default function MyBookingsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const { openConversation } = useMessaging();

  const created = useCreatedCarpools();
  const update = useUpdateJoinRequest();

  const bookings = created.data?.carpools ?? [];

  const requestQueries = useQueries({
  queries: bookings.map((carpool) => ({
    queryKey: ["carpools", carpool.id, "requests"],
    queryFn: () => getIncomingRequests(carpool.id),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  })),
});

  const items: BookingCarpool[] = bookings.map(
    (carpool, index) => ({
      ...carpool,
      requests: (
        requestQueries[index]?.data?.requests ?? []
      ).map((request) => ({
        ...request,
        username: request.user?.username ?? "User",
        profilePhotoUrl:
          request.user?.profilePhotoUrl ?? undefined,
      })),
    }),
  );

  const allRequests = items.flatMap(
    (item) => item.requests,
  );

  const query = search.toLowerCase().trim();

  const filtered = items.filter((carpool) => {
    const locationMatch =
      carpool.pickupPoint.toLowerCase().includes(query) ||
      carpool.destinationPoint.toLowerCase().includes(query);

    const statusMatch =
      filter === "ALL" ||
      carpool.requests.some(
        (request) => request.status === filter,
      );

    return locationMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-[#F7FAFA]">
      <Sidebar />

      <main className="min-h-screen pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[90px] items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <p className="text-sm text-gray-400">
              UniRyde / My Bookings
            </p>

            <h1 className="text-lg font-semibold text-gray-800">
              Incoming Booking Requests
            </h1>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 font-semibold text-[#009F9F]">
            U
          </div>
        </header>

        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Incoming Requests
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Manage students requesting to join your carpools.
          </p>

          <div className="my-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              label="Total Requests"
              value={allRequests.length}
              icon={<Inbox size={20} />}
            />

            <Stat
              label="Pending Requests"
              value={
                allRequests.filter(
                  (request) =>
                    request.status === "PENDING",
                ).length
              }
              icon={<Clock size={20} />}
            />

            <Stat
              label="Accepted Requests"
              value={
                allRequests.filter(
                  (request) =>
                    request.status === "ACCEPTED",
                ).length
              }
              icon={<CheckCircle2 size={20} />}
            />
          </div>

          <div className="mb-7 flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by pickup or destination..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm"
              />
            </div>

            {[
              "ALL",
              "PENDING",
              "ACCEPTED",
              "REJECTED",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                  filter === item
                    ? "bg-[#009F9F] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {created.isLoading ? (
            <p className="text-sm text-gray-500">
              Loading requests...
            </p>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {filtered.map((carpool) => (
                <BookingRequestCard
                  key={carpool.id}
                  carpool={carpool}
                  onRequestAction={(
                    carpoolId,
                    requestId,
                    action,
                  ) =>
                    update.mutateAsync({
                      carpoolId,
                      requestId,
                      action,
                    })
                  }
                  onOpenChat={openConversation}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-500">
              <Users className="mx-auto mb-3 text-[#009F9F]" />
              No booking requests found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="text-[#009F9F]">{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}