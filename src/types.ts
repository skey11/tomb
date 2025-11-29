export type Tombstone = {
  id: string;
  onchainId?: number;
  name: string;
  epitaph: string;
  position: [number, number, number];
  tilt?: number;
  height?: number;
  respectTotal?: number;
  owner?: string;
};
