import { FormEvent, useState } from "react";

type Props = {
  isBusy?: boolean;
  disabled?: boolean;
  error?: string | null;
  onSubmit: (payload: { name: string; epitaph: string }) => Promise<void> | void;
};

const NewTombForm = ({ onSubmit, isBusy, disabled, error }: Props) => {
  const [name, setName] = useState("");
  const [epitaph, setEpitaph] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !epitaph.trim() || disabled) return;
    await onSubmit({ name: name.trim(), epitaph: epitaph.trim() });
    setName("");
    setEpitaph("");
  };

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-xl p-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">Bury A New Token</p>
        <p className="text-xs text-white/50">0.002 MON to carve a fresh epitaph on-chain.</p>
      </div>
      <input
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-neon"
        placeholder="名称 / ticker（支持中文）"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={24}
        disabled={isBusy || disabled}
      />
      <textarea
        className="h-20 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-neon"
        placeholder="墓志铭 / epitaph"
        value={epitaph}
        onChange={(e) => setEpitaph(e.target.value)}
        maxLength={120}
        disabled={isBusy || disabled}
      />
      <button
        type="submit"
        disabled={isBusy || disabled}
        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-neon to-gold px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:opacity-60"
      >
        {isBusy ? "链上确认中..." : "创建墓碑"}
      </button>
      {error && (
        <div
          className="mt-1 max-w-full break-words rounded-lg border border-red-300/30 bg-red-500/10 px-2 py-1 text-[11px] text-red-100"
          style={{ maxHeight: "72px", overflowY: "auto", overflowX: "hidden",width:'264px' }}
          title={error}
        >
          {error}
        </div>
      )}
      {disabled && (
        <p className="text-xs text-red-200/80">
          请先在环境变量中配置合约地址，或部署合约后再试。
        </p>
      )}
    </form>
  );
};

export default NewTombForm;
