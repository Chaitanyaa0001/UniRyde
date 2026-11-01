export type CarpoolStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";



export type Carpool = {
  id: string;
  userId: string;
  pickupPoint: string;
  destinationPoint: string;
  departureTime: string;
  requiredPeople: number;
  status: CarpoolStatus;
  user: PublicUser;
  acceptedMembersCount: number;
  availableSeats: number;
  _count?: {
    members: number;
    requests: number;
  };
  createdAt: string;
  updatedAt: string;
  currentUserRequest?: {
    status: RequestStatus;
  } | null;
};
export type PublicUser = {
  id: string;
  username: string;
  profilePhotoUrl: string | null;
};

export type CarpoolRequest = {
  id: string;
  carpoolId: string;
  userId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  user?: PublicUser;
  conversationId?: string | null;
};

export type CreateCarpoolPayload = {
  pickupPoint: string;
  destinationPoint: string;
  departureTime: string;
  requiredPeople: number;
};
