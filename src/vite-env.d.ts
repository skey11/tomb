/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_CHAIN_NAME?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_TOMB_CONTRACT_ADDRESS?: `0x${string}`;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
