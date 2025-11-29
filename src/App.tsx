import { useCallback, useEffect, useMemo, useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, ConnectButton, midnightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, usePublicClient, useWriteContract } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Abi, Chain, Hex, http, parseEther } from "viem";
import SpaceScene from "./components/SpaceScene";
import RespectCounter from "./components/RespectCounter";
import NewTombForm from "./components/NewTombForm";
import { baseTombs } from "./data/tombs";
import { Tombstone } from "./types";
import { fetchTombContractAbi, TOMB_CONTRACT_ABI, TOMB_CONTRACT_ADDRESS } from "./contract";

const chainId = Number(import.meta.env.VITE_CHAIN_ID ?? 5777);
const rpcUrl = import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:7545";

const localChain: Chain = {
  id: chainId,
  name: import.meta.env.VITE_CHAIN_NAME ?? "Local Ganache",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] }
  }
};

const wagmiConfig = getDefaultConfig({
  appName: "On-chain Tomb",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "demo", // replace in .env
  chains: [localChain],
  transports: {
    [localChain.id]: http(localChain.rpcUrls.default.http[0])
  }
});

const qc = new QueryClient();

const InfoCard = ({
  selected,
  onRespect,
  respecting,
  respectCount,
  respectEnabled,
  hasContract,
  abiReady
}: {
  selected?: Tombstone | null;
  onRespect: () => void;
  respecting: boolean;
  respectCount: number;
  respectEnabled: boolean;
  hasContract: boolean;
  abiReady: boolean;
}) => {
  const buttonLabel = respecting
    ? "链上确认中..."
    : respectEnabled
    ? "Press F to Pay Respects"
    : selected
    ? abiReady
      ? "请选择可上链的墓碑"
      : "加载链上数据..."
    : "先选择一块墓碑";

  const badgeLabel = respectEnabled
    ? "0.001 MON"
    : hasContract
    ? "等待链上同步"
    : "缺少合约/ID";

  return (
    <div className="glass w-full max-w-md rounded-2xl p-5 shadow-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Orbiting Epitaph</p>
      <h2 className="mt-1 text-2xl font-semibold text-neon drop-shadow-glow">
        {selected ? selected.name : "Pick a tombstone"}
      </h2>
      <p className="mt-2 text-sm text-white/70">
        {selected ? selected.epitaph : "拖动视角，点选一块碑石，致敬那些归零的传奇。"}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onRespect}
          disabled={!selected || respecting || !respectEnabled}
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-neon to-gold px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
        >
          {buttonLabel}
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
            {badgeLabel}
          </span>
        </button>
        <RespectCounter count={respectCount} />
      </div>
    </div>
  );
};

const AppInner = () => {
  const applyLayout = useCallback((list: Tombstone[]) => {
    return list.map((t, idx) => {
      const angle = idx * 2.39996; // golden-angle spiral keeps spacing even as count grows
      const radius = 5 + Math.sqrt(idx) * 2.3;
      const y = 0.6 + Math.sin(idx * 0.45) * 0.35;
      return {
        ...t,
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
        tilt: t.tilt ?? Math.sin(idx * 0.5) * 0.12,
        height: t.height ?? 2.1 + Math.sin(idx * 0.8) * 0.3
      };
    });
  }, []);

  const [tombs, setTombs] = useState<Tombstone[]>(() => applyLayout(baseTombs));
  const [selectedId, setSelectedId] = useState<string | undefined>(baseTombs[0]?.id);
  const [respectCount, setRespectCount] = useState(12);
  const [burstTarget, setBurstTarget] = useState<Tombstone | null>(null);
  const [abi, setAbi] = useState<Abi | null>(null);
  const [abiError, setAbiError] = useState<string | null>(null);
  const [buryError, setBuryError] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const hasContract = TOMB_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
  const abiReady = Boolean(abi);
  const runtimeAbi = (abi ?? TOMB_CONTRACT_ABI) as Abi;

  const selected = useMemo(() => tombs.find((t) => t.id === selectedId), [tombs, selectedId]);

  const { writeContractAsync, isPending } = useWriteContract();

  const loadOnchainTombs = useCallback(async () => {
    if (!publicClient || !hasContract || !abiReady) return;
    try {
      const code = await publicClient.getBytecode({ address: TOMB_CONTRACT_ADDRESS as Hex });
      if (!code || code === "0x") {
        setAbiError("指定的合约地址上没有代码，请确认 .env 中地址与当前网络匹配并已部署。");
        return;
      }

      const tombCount = (await publicClient.readContract({
        address: TOMB_CONTRACT_ADDRESS as Hex,
        abi: runtimeAbi,
        functionName: "tombCount"
      })) as bigint;
      const ids = Array.from({ length: Number(tombCount) }, (_, i) => i);
      const onchain = await Promise.all(
        ids.map(async (i) => {
          const data = (await publicClient.readContract({
            address: TOMB_CONTRACT_ADDRESS as Hex,
            abi: runtimeAbi,
            functionName: "tombs",
            args: [BigInt(i)]
          })) as [string, string, string, bigint];
          return {
            id: `onchain-${i}`,
            onchainId: i,
            name: data[0],
            epitaph: data[1],
            owner: data[2],
            respectTotal: Number(data[3]),
            position: [0, 0, 0] as [number, number, number]
          } satisfies Tombstone;
        })
      );

      if (onchain.length > 0) {
        const laidOut = applyLayout(onchain);
        setTombs(laidOut);
        setSelectedId((prev) => prev ?? laidOut[0]?.id);
        const sel = laidOut.find((t) => t.id === (selectedId ?? laidOut[0]?.id));
        if (sel?.respectTotal !== undefined) setRespectCount(sel.respectTotal);
      }
    } catch (err) {
      console.error("loadOnchainTombs failed", err);
      setAbiError(err instanceof Error ? err.message : "加载链上墓碑失败");
    }
  }, [publicClient, hasContract, abiReady, runtimeAbi, applyLayout, selectedId]);

  const handleRespect = useCallback(async () => {
    if (!selected || selected.onchainId === undefined || !publicClient || !hasContract || !abiReady) return;
    try {
      const hash = (await writeContractAsync({
        address: TOMB_CONTRACT_ADDRESS as Hex,
        abi: runtimeAbi,
        functionName: "payRespect",
        args: [BigInt(selected.onchainId)],
        value: parseEther("0.001")
      })) as Hex;

      await publicClient.waitForTransactionReceipt({ hash });

      const updated = (await publicClient.readContract({
        address: TOMB_CONTRACT_ADDRESS as Hex,
        abi: runtimeAbi,
        functionName: "tombs",
        args: [BigInt(selected.onchainId)]
      })) as [string, string, string, bigint];

      setTombs((prev) =>
        prev.map((t) =>
          t.onchainId === selected.onchainId ? { ...t, respectTotal: Number(updated[3]) } : t
        )
      );
      setRespectCount(Number(updated[3]));
      setBurstTarget(selected);
      setTimeout(() => setBurstTarget(null), 1400);
    } catch (err) {
      console.error("Respect transaction failed", err);
    }
  }, [selected, publicClient, writeContractAsync, hasContract]);

  const handleBury = useCallback(
    async ({ name, epitaph }: { name: string; epitaph: string }) => {
      setBuryError(null);
      if (!isConnected) {
        setBuryError("请先连接钱包（Metamask）再创建墓碑。");
        throw new Error("wallet not connected");
      }
      if (!hasContract) {
        setBuryError("缺少合约地址，请检查 .env 中的 VITE_TOMB_CONTRACT_ADDRESS。");
        throw new Error("missing contract address");
      }
      if (!abiReady) {
        setBuryError("ABI 未加载，刷新页面或检查 public/TombGarden.json。");
        throw new Error("abi not ready");
      }
      if (!publicClient) {
        setBuryError("RPC 未就绪，确认本地节点已启动。");
        throw new Error("public client missing");
      }
      try {
        const hash = (await writeContractAsync({
          address: TOMB_CONTRACT_ADDRESS as Hex,
        abi: runtimeAbi,
          functionName: "bury",
          args: [name, epitaph],
          value: parseEther("0.002")
        })) as Hex;

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        // fetch latest tomb data from chain
        const tombCount = (await publicClient.readContract({
          address: TOMB_CONTRACT_ADDRESS as Hex,
          abi: runtimeAbi,
          functionName: "tombCount"
        })) as bigint;
        const newId = Number(tombCount) - 1;
        const tombData = (await publicClient.readContract({
          address: TOMB_CONTRACT_ADDRESS as Hex,
          abi: (abi ?? TOMB_CONTRACT_ABI) as Abi,
          functionName: "tombs",
          args: [BigInt(newId)]
        })) as [string, string, string, bigint];

      const newTomb: Tombstone = {
        id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        onchainId: newId,
        name: tombData[0],
        epitaph: tombData[1],
          owner: tombData[2],
          respectTotal: Number(tombData[3]),
          position: [0, 0, 0]
        };

        const laidOut = applyLayout([...tombs.filter((t) => t.onchainId !== undefined), newTomb]);
        setTombs(laidOut);
        setSelectedId(newTomb.id);
        setBurstTarget(newTomb);
        setRespectCount(Number(tombData[3]));
        setTimeout(() => setBurstTarget(null), 1500);
        console.info("Bury tx", receipt.transactionHash);
      } catch (err) {
        console.error("Bury transaction failed", err);
        setBuryError(err instanceof Error ? err.message : "创建墓碑交易失败");
        throw err;
      }
    },
    [publicClient, writeContractAsync, hasContract, abiReady, isConnected, runtimeAbi, applyLayout, tombs]
  );

  useEffect(() => {
    fetchTombContractAbi()
      .then((loadedAbi) => setAbi(loadedAbi))
      .catch((err) => {
        console.error("Failed to load ABI", err);
        setAbiError(err instanceof Error ? err.message : "Failed to load ABI");
      });
  }, []);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        handleRespect();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleRespect]);

  useEffect(() => {
    loadOnchainTombs();
  }, [loadOnchainTombs]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 pointer-events-auto">
        <SpaceScene tombs={tombs} selectedId={selectedId} onSelect={setSelectedId} burstAt={burstTarget} />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(111,255,233,0.09),transparent_30%)]" />

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <header className="pointer-events-auto flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Monad Necropolis</p>
            <h1 className="text-2xl font-semibold text-neon drop-shadow-glow">On-chain Tomb Garden</h1>
          </div>
          <div className="pointer-events-auto">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </header>

        <main className="pointer-events-none flex flex-1 flex-col justify-end gap-4 px-6 pb-8">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr] pointer-events-none">
            <div className="pointer-events-auto w-fit">
              <InfoCard
                selected={selected}
                onRespect={handleRespect}
                respecting={isPending}
                respectCount={respectCount}
                respectEnabled={Boolean(selected && selected.onchainId !== undefined && hasContract && abiReady)}
                hasContract={hasContract}
                abiReady={abiReady}
              />
            </div>
            <div className="pointer-events-auto w-fit md:ml-auto">
              <NewTombForm
                onSubmit={handleBury}
                isBusy={isPending}
                disabled={!hasContract || !abiReady}
                error={buryError}
              />
            </div>
          </div>

      {abiError && (
        <div className="pointer-events-auto glass w-fit rounded-full px-4 py-2 text-xs text-red-200">
          ABI 加载失败：{abiError}
        </div>
      )}

      {!isConnected && (
        <div className="pointer-events-auto glass w-fit rounded-full px-4 py-2 text-xs text-white/70">
          连接钱包，随时F一下。Monad 极速确认，无需等待。
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={qc}>
      <RainbowKitProvider theme={midnightTheme({ accentColor: "#6fffe9", accentColorForeground: "#050510" })}>
        <AppInner />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
