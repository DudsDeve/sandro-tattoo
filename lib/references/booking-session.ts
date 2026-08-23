export type BookingReference = {
  imageUrl: string;
  url?: string;
  title?: string;
};

const KEY = "versus_booking_refs";

export function getBookingReferences(): BookingReference[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as BookingReference[];
    return Array.isArray(data) ? data.filter((r) => r?.imageUrl) : [];
  } catch {
    return [];
  }
}

export function addBookingReference(ref: BookingReference) {
  if (typeof window === "undefined") return;
  const next = [ref, ...getBookingReferences().filter((r) => r.imageUrl !== ref.imageUrl)].slice(0, 5);
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function clearBookingReferences() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
