export const verificationEvents = [
  {
    id: "vrf-501",
    type: "delivery",
    partner: "Skyline Shelter",
    code: "GC-AR52",
    scheduledFor: "2025-11-20T16:00:00Z",
    notes: "Driver will meet operations lead at loading bay B.",
  },
  {
    id: "vrf-502",
    type: "pickup",
    partner: "City Food Bank",
    code: "GC-XN19",
    scheduledFor: "2025-11-21T10:15:00Z",
    notes: "Requires refrigerated truck; confirm seal before departure.",
  },
];

export function getVerificationEvent(eventId) {
  return verificationEvents.find((event) => event.id === eventId);
}

