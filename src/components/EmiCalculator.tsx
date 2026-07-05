import { useState, useEffect, useCallback } from "react";
import { Calculator, IndianRupee } from "lucide-react";
import { formatPriceLabel } from "@/lib/format";

interface Props {
  defaultLoanAmount?: number;
}

function calcEmi(principal: number, annualRate: number, tenureYears: number): number {
  if (annualRate === 0) return principal / (tenureYears * 12);
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function EmiCalculator({ defaultLoanAmount = 5000000 }: Props) {
  const [loan, setLoan]     = useState(defaultLoanAmount);
  const [rate, setRate]     = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [emi, setEmi]       = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const compute = useCallback(() => {
    const monthlyEmi = calcEmi(loan, rate, tenure);
    const total = monthlyEmi * tenure * 12;
    setEmi(Math.round(monthlyEmi));
    setTotalInterest(Math.round(total - loan));
  }, [loan, rate, tenure]);

  useEffect(() => { compute(); }, [compute]);

  const totalPayable = loan + totalInterest;
  const principalPct = totalPayable > 0 ? Math.round((loan / totalPayable) * 100) : 50;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none bg-white";
  const rangeCls = "w-full h-1.5 rounded-full accent-accent cursor-pointer";

  return (
    <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl2 border border-accent/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl2 bg-accent flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg">EMI Calculator</h2>
          <p className="text-xs text-muted">Estimate your monthly repayment</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink-700">Loan Amount</label>
            <span className="text-xs font-bold text-accent">{formatPriceLabel(loan)}</span>
          </div>
          <input
            type="range"
            min={500000}
            max={50000000}
            step={100000}
            value={loan}
            onChange={(e) => setLoan(Number(e.target.value))}
            className={rangeCls}
          />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>₹5L</span><span>₹5Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink-700">Interest Rate (p.a.)</label>
            <span className="text-xs font-bold text-accent">{rate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className={rangeCls}
          />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>5%</span><span>20%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-semibold text-ink-700">Tenure</label>
            <span className="text-xs font-bold text-accent">{tenure} yr{tenure > 1 ? "s" : ""}</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className={rangeCls}
          />
          <div className="flex justify-between text-[10px] text-muted mt-1">
            <span>1 yr</span><span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 bg-accent rounded-xl2 p-5 text-white">
        <p className="text-sm opacity-80 mb-1">Monthly EMI</p>
        <p className="font-display font-bold text-3xl flex items-center gap-1">
          <IndianRupee className="w-6 h-6" />
          {emi.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-2">
        {/* Principal vs Interest bar */}
        <div className="h-2 rounded-full overflow-hidden bg-red-100 flex">
          <div
            className="bg-accent h-full rounded-l-full transition-all duration-300"
            style={{ width: `${principalPct}%` }}
          />
          <div
            className="bg-red-400 h-full rounded-r-full transition-all duration-300"
            style={{ width: `${100 - principalPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            <span className="text-muted">Principal</span>
            <span className="font-semibold">{formatPriceLabel(loan)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            <span className="text-muted">Interest</span>
            <span className="font-semibold">{formatPriceLabel(totalInterest)}</span>
          </span>
        </div>
        <div className="flex justify-between text-xs pt-2 border-t border-line">
          <span className="text-muted">Total Payable</span>
          <span className="font-bold">{formatPriceLabel(totalPayable)}</span>
        </div>
      </div>

      {/* Quick edit inputs */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-muted mb-1">Loan (₹)</p>
          <input
            type="number"
            min={100000}
            max={100000000}
            step={100000}
            value={loan}
            onChange={(e) => setLoan(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <p className="text-[10px] text-muted mb-1">Rate (%)</p>
          <input
            type="number"
            min={1}
            max={30}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <p className="text-[10px] text-muted mb-1">Tenure (yr)</p>
          <input
            type="number"
            min={1}
            max={30}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      <p className="text-[10px] text-muted mt-3 leading-relaxed">
        *Indicative only. Actual EMI may vary based on bank policies, processing fees, and credit score.
        Lower rate = lower EMI.
      </p>
    </div>
  );
}
