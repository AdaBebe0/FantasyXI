"use client";

import React, { useState } from "react";
import { IconTrophy, IconShield } from "@/components/ui/Icons";

export interface PrizeCalculatorProps {
  entryFee: number;
  participants: number;
}

export const PrizeCalculator: React.FC<PrizeCalculatorProps> = ({
  entryFee,
  participants,
}) => {
  const [simulatedParticipants, setSimulatedParticipants] = useState(
    Math.min(100, Math.max(2, Math.round(participants || 2)))
  );

  const count = Math.min(100, Math.max(2, simulatedParticipants));
  const fee = Math.max(0, entryFee);
  const grossTotal = Math.round(fee * count * 100) / 100;
  const platformFee = Math.round(grossTotal * 0.05 * 100) / 100;
  const prizePool = Math.round((grossTotal - platformFee) * 100) / 100;

  const firstPercent = count === 2 ? 70 : 60;
  const secondPercent = count === 2 ? 30 : 30;
  const thirdPercent = count === 2 ? 0 : 10;
  const firstPrize = Math.round(prizePool * (firstPercent / 100) * 100) / 100;
  const secondPrize = Math.round(prizePool * (secondPercent / 100) * 100) / 100;
  const thirdPrize = Math.round((prizePool - firstPrize - secondPrize) * 100) / 100;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconTrophy className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Automated Prize Distribution
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold font-mono">
          <IconShield className="w-3.5 h-3.5" />
          <span>Soroban Smart Contract</span>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="participant-simulator" className="text-xs font-bold text-slate-700">
            Participant simulator
          </label>
          <span className="font-mono text-sm font-black text-[#37003c]">
            {count} players
          </span>
        </div>
        <input
          id="participant-simulator"
          type="range"
          min={2}
          max={100}
          step={1}
          value={count}
          onChange={(event) => setSimulatedParticipants(Number(event.target.value))}
          className="w-full accent-[#37003c]"
          aria-label="Simulated participant count"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>2 min</span>
          <span>100 max</span>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">
            Gross Pot
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
            ${grossTotal.toFixed(2)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">
            Platform Fee (5%)
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-500 mt-0.5">
            ${platformFee.toFixed(2)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">
            Prize Pool (95%)
          </div>
          <div className="text-sm sm:text-base font-black text-emerald-700 mt-0.5">
            ${prizePool.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Winner Payout Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200/80">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <span className="font-bold text-amber-900">1st Place Champion ({firstPercent}%)</span>
          </div>
          <span className="font-mono font-black text-slate-900 text-sm">
            ${firstPrize.toFixed(2)} USDC
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-black text-[10px] flex items-center justify-center font-mono">
              2
            </span>
            <span className="font-bold text-slate-700">2nd Place Runner-Up ({secondPercent}%)</span>
          </div>
          <span className="font-mono font-bold text-slate-800">
            ${secondPrize.toFixed(2)} USDC
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center font-mono">
              3
            </span>
            <span className="font-bold text-slate-600">3rd Place Podium ({thirdPercent}%)</span>
          </div>
          <span className="font-mono font-bold text-slate-700">
            ${thirdPrize.toFixed(2)} USDC
          </span>
        </div>
      </div>
    </div>
  );
};
