"use client";

import { useMemo, useState } from "react";

function monthlyMortgagePayment(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;

  if (principal <= 0 || n <= 0) return 0;
  if (monthlyRate === 0) return principal / n;

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export default function Page() {
  const [nestPrice, setNestPrice] = useState(950000);
  const [nestDownPct, setNestDownPct] = useState(20);
  const [nestRate, setNestRate] = useState(6.5);
  const [nestTerm, setNestTerm] = useState(30);
  const [nestTaxes, setNestTaxes] = useState(950);
  const [nestInsurance, setNestInsurance] = useState(180);
  const [nestMaintenance, setNestMaintenance] = useState(400);
  const [nestHoa, setNestHoa] = useState(0);

  const [investPrice, setInvestPrice] = useState(1150000);
  const [investDownPct, setInvestDownPct] = useState(20);
  const [investRate, setInvestRate] = useState(6.75);
  const [investTerm, setInvestTerm] = useState(30);
  const [investTaxes, setInvestTaxes] = useState(1150);
  const [investInsurance, setInvestInsurance] = useState(250);
  const [investMaintenance, setInvestMaintenance] = useState(550);
  const [investRent, setInvestRent] = useState(3200);
  const [investVacancyPct, setInvestVacancyPct] = useState(5);
  const [investReservePct, setInvestReservePct] = useState(8);

  const nest = useMemo(() => {
    const down = nestPrice * (nestDownPct / 100);
    const loan = nestPrice - down;
    const mortgage = monthlyMortgagePayment(loan, nestRate, nestTerm);
    const totalMonthly = mortgage + nestTaxes + nestInsurance + nestMaintenance + nestHoa;

    return { down, loan, mortgage, totalMonthly };
  }, [nestPrice, nestDownPct, nestRate, nestTerm, nestTaxes, nestInsurance, nestMaintenance, nestHoa]);

  const invest = useMemo(() => {
    const down = investPrice * (investDownPct / 100);
    const loan = investPrice - down;
    const mortgage = monthlyMortgagePayment(loan, investRate, investTerm);
    const totalMonthly = mortgage + investTaxes + investInsurance + investMaintenance;
    const effectiveRent = investRent * (1 - investVacancyPct / 100);
    const reserves = investRent * (investReservePct / 100);
    const netRentContribution = effectiveRent - reserves;
    const netMonthlyCost = totalMonthly - netRentContribution;
    const subsidyPct = totalMonthly > 0 ? (netRentContribution / totalMonthly) * 100 : 0;

    return {
      down,
      loan,
      mortgage,
      totalMonthly,
      netRentContribution,
      netMonthlyCost,
      subsidyPct,
    };
  }, [
    investPrice,
    investDownPct,
    investRate,
    investTerm,
    investTaxes,
    investInsurance,
    investMaintenance,
    investRent,
    investVacancyPct,
    investReservePct,
  ]);

  const recommendation =
    invest.netMonthlyCost < nest.totalMonthly
      ? `Invest lowers your effective monthly cost by ${formatCurrency(
          nest.totalMonthly - invest.netMonthlyCost
        )} per month.`
      : "Nest keeps things simpler and may be the better fit based on these assumptions.";

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "8px" }}>Nest or Invest</h1>
      <p style={{ fontSize: "18px", color: "#555", marginBottom: "24px" }}>
        Compare a single-family home with an owner-occupied multi-family property.
      </p>

      <div
        style={{
          background: "#eef6ff",
          padding: "18px",
          borderRadius: "12px",
          marginBottom: "28px",
          border: "1px solid #cfe3ff",
        }}
      >
        <strong>Recommendation:</strong> {recommendation}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Nest: Single-Family Home</h2>
          <Field label="Purchase Price" value={nestPrice} setValue={setNestPrice} />
          <Field label="Down Payment %" value={nestDownPct} setValue={setNestDownPct} />
          <Field label="Interest Rate %" value={nestRate} setValue={setNestRate} />
          <Field label="Loan Term (Years)" value={nestTerm} setValue={setNestTerm} />
          <Field label="Taxes / Month" value={nestTaxes} setValue={setNestTaxes} />
          <Field label="Insurance / Month" value={nestInsurance} setValue={setNestInsurance} />
          <Field label="Maintenance / Month" value={nestMaintenance} setValue={setNestMaintenance} />
          <Field label="HOA / Month" value={nestHoa} setValue={setNestHoa} />
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Invest: Multi-Family</h2>
          <Field label="Purchase Price" value={investPrice} setValue={setInvestPrice} />
          <Field label="Down Payment %" value={investDownPct} setValue={setInvestDownPct} />
          <Field label="Interest Rate %" value={investRate} setValue={setInvestRate} />
          <Field label="Loan Term (Years)" value={investTerm} setValue={setInvestTerm} />
          <Field label="Taxes / Month" value={investTaxes} setValue={setInvestTaxes} />
          <Field label="Insurance / Month" value={investInsurance} setValue={setInvestInsurance} />
          <Field label="Maintenance / Month" value={investMaintenance} setValue={setInvestMaintenance} />
          <Field label="Rent from Other Unit(s)" value={investRent} setValue={setInvestRent} />
          <Field label="Vacancy %" value={investVacancyPct} setValue={setInvestVacancyPct} />
          <Field label="Reserve %" value={investReservePct} setValue={setInvestReservePct} />
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Nest Results</h2>
          <Result label="Cash to Close" value={formatCurrency(nest.down)} />
          <Result label="Loan Amount" value={formatCurrency(nest.loan)} />
          <Result label="Mortgage Payment" value={formatCurrency(nest.mortgage)} />
          <Result label="Total Monthly Cost" value={formatCurrency(nest.totalMonthly)} />
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Invest Results</h2>
          <Result label="Cash to Close" value={formatCurrency(invest.down)} />
          <Result label="Loan Amount" value={formatCurrency(invest.loan)} />
          <Result label="Mortgage Payment" value={formatCurrency(invest.mortgage)} />
          <Result label="Total Monthly Cost" value={formatCurrency(invest.totalMonthly)} />
          <Result label="Net Rental Contribution" value={formatCurrency(invest.netRentContribution)} />
          <Result label="Effective Monthly Cost" value={formatCurrency(invest.netMonthlyCost)} />
          <Result label="Tenant Subsidy" value={`${Math.max(0, invest.subsidyPct).toFixed(0)}%`} />
        </section>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  borderRadius: "16px",
  padding: "20px",
  background: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

function Field({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "14px", marginBottom: "4px", color: "#334155" }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value || 0))}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "14px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #e5e7eb",
        gap: "16px",
      }}
    >
      <span style={{ color: "#475569" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}