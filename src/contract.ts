import { Abi } from "viem";

export const TOMB_CONTRACT_ADDRESS =
  (import.meta.env.VITE_TOMB_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000"; // replace with deployed address

const ARTIFACT_URL = `${import.meta.env.BASE_URL ?? "/"}TombGarden.json`;

let cachedAbi: Abi | null = null;
let pending: Promise<Abi> | null = null;

export const fetchTombContractAbi = async (): Promise<Abi> => {
  if (cachedAbi) return cachedAbi;
  if (pending) return pending;
  pending = fetch(ARTIFACT_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch TombGarden.json: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then((data: { abi?: Abi }) => {
      if (!data?.abi) throw new Error("TombGarden.json missing abi field");
      cachedAbi = data.abi;
      return cachedAbi;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
};

// Static fallback so types remain available at build time; runtime will prefer fetched ABI.
export const TOMB_CONTRACT_ABI = [
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: []
  },
  {
    type: "event",
    name: "RespectPaid",
    anonymous: false,
    inputs: [
      { name: "tombId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "payer", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" }
    ]
  },
  {
    type: "event",
    name: "TombBuried",
    anonymous: false,
    inputs: [
      { name: "tombId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "epitaph", type: "string", indexed: false, internalType: "string" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" }
    ]
  },
  {
    type: "function",
    name: "buryFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "respectFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "buryFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "tombCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "tombs",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "epitaph", type: "string", internalType: "string" },
      { name: "owner", type: "address", internalType: "address" },
      { name: "totalRespect", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "setFees",
    inputs: [
      { name: "newBuryFee", type: "uint256", internalType: "uint256" },
      { name: "newRespectFee", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "bury",
    inputs: [
      { name: "name", type: "string", internalType: "string" },
      { name: "epitaph", type: "string", internalType: "string" }
    ],
    outputs: [{ name: "tombId", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "payRespect",
    inputs: [{ name: "tombId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "to", type: "address", internalType: "address payable" }],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const satisfies Abi;
