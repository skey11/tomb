import { Tombstone } from "../types";

export const baseTombs: Tombstone[] = [
  {
    id: "luna",
    onchainId: 0,
    name: "LUNA",
    epitaph: "Algorithmic stablecoin, human panic.",
    position: [-6, 0.5, -4],
    tilt: -0.08
  },
  {
    id: "ftx",
    onchainId: 1,
    name: "FTX",
    epitaph: "SBF queued trades between League matches.",
    position: [4, 1, -3.5],
    tilt: 0.04
  },
  {
    id: "3ac",
    onchainId: 2,
    name: "3AC",
    epitaph: "Sailed too close to the leverage sun.",
    position: [1, 0.6, 4],
    tilt: -0.06
  },
  {
    id: "bitconnect",
    onchainId: 3,
    name: "BITCONNECT",
    epitaph: "The meme was real until it wasn't.",
    position: [-2, 0.9, 2.5]
  },
  {
    id: "mtgox",
    onchainId: 4,
    name: "Mt. Gox",
    epitaph: "A hot wallet cold shower.",
    position: [6, 0.7, 1.5]
  }
];
