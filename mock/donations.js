export const donations = [
  {
    id: "dn-1001",
    donor: "Harvest Kitchen Collective",
    category: "Prepared Meals",
    quantityLbs: 240,
    readyBy: "2025-11-20T14:30:00Z",
    status: "available",
    location: "Mission District, SF",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: "dn-1002",
    donor: "Fresh Fields Market",
    category: "Produce",
    quantityLbs: 180,
    readyBy: "2025-11-20T12:00:00Z",
    status: "claimed",
    location: "Downtown Oakland",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=60",
  },
  {
    id: "dn-1003",
    donor: "Sunset Catering",
    category: "Frozen Meals",
    quantityLbs: 320,
    readyBy: "2025-11-21T09:00:00Z",
    status: "in_transit",
    location: "SoMa, SF",
    image:
      "https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&w=600&q=60",
  },
];

export function getDonationById(id) {
  return donations.find((donation) => donation.id === id);
}

