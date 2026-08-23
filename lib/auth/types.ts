export type SavedPin = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  savedAt: string;
};

export type SiteUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type SiteUserRecord = SiteUser & {
  passwordHash: string;
  savedPins: SavedPin[];
};
