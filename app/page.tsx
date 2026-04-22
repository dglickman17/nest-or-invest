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
  const [nestTaxRate, setNestTaxRate] = useState(1.2);
  const [nestInsuranceRate, setNestInsuranceRate] = useState(0.23);
  const [nestMaintenance, setNestMaintenance] = useState(400);
  const [nestHoa, setNestHoa] = useState(0);

  const [investPrice, setInvestPrice] = useState(1150000);
  const [investDownPct, setInvestDownPct] = useState(20);
  const [investRate, setInvestRate] = useState(6.75);
  const [investTerm, setInvestTerm] = useState(30);
  const [investTaxRate, setInvestTaxRate] = useState(1.2);
  const [investInsuranceRate, setInvestInsuranceRate] = useState(0.26);
  const [investMaintenance, setInvestMaintenance] = useState(550);
  const [investRent, setInvestRent] = useState(3200);
  const [investVacancyPct, setInvestVacancyPct] = useState(5);
  const [investReservePct, setInvestReservePct] = useState(8);
  const [leadStatus, setLeadStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const nest = useMemo(() => {
    const down = nestPrice * (nestDownPct / 100);
    const loan = nestPrice - down;
    const mortgage = monthlyMortgagePayment(loan, nestRate, nestTerm);
    const taxes = (nestPrice * (nestTaxRate / 100)) / 12;
    const insurance = (nestPrice * (nestInsuranceRate / 100)) / 12;
    const totalMonthly = mortgage + taxes + insurance + nestMaintenance + nestHoa;

    return { down, loan, mortgage, taxes, insurance, totalMonthly };
  }, [nestPrice, nestDownPct, nestRate, nestTerm, nestTaxRate, nestInsuranceRate, nestMaintenance, nestHoa]);

  const invest = useMemo(() => {
    const down = investPrice * (investDownPct / 100);
    const loan = investPrice - down;
    const mortgage = monthlyMortgagePayment(loan, investRate, investTerm);
    const taxes = (investPrice * (investTaxRate / 100)) / 12;
    const insurance = (investPrice * (investInsuranceRate / 100)) / 12;
    const totalMonthly = mortgage + taxes + insurance + investMaintenance;
    const effectiveRent = investRent * (1 - investVacancyPct / 100);
    const reserves = investRent * (investReservePct / 100);
    const netRentContribution = effectiveRent - reserves;
    const netMonthlyCost = totalMonthly - netRentContribution;
    const subsidyPct = totalMonthly > 0 ? (netRentContribution / totalMonthly) * 100 : 0;

    return {
      down,
      loan,
      mortgage,
      taxes,
      insurance,
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
      investTaxRate,
      investInsuranceRate,
      investMaintenance,
      investRent,
      investVacancyPct,
      investReservePct,
]);

  const monthlyDifference = Math.abs(nest.totalMonthly - invest.netMonthlyCost);
  const investWins = invest.netMonthlyCost < nest.totalMonthly;

  const recommendation = investWins
    ? `Invest lowers your effective monthly cost by ${formatCurrency(monthlyDifference)} per month.`
    : `Nest costs ${formatCurrency(monthlyDifference)} less per month under these assumptions.`;

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setLeadStatus("submitting");

  const payload = {
  name,
  email,
  phone,
  notes,
  nest_monthly: formatCurrency(nest.totalMonthly),
  invest_monthly: formatCurrency(invest.netMonthlyCost),
  recommendation: investWins ? "Invest" : "Nest",
};

  try {
    const response = await fetch("https://formspree.io/f/mlgarpaj", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setLeadStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
    } else {
      setLeadStatus("error");
    }
  } catch (error) {
    setLeadStatus("error");
  }
}

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>Nest or Invest</div>
          <h1 style={heroTitleStyle}>Should you buy the home you want, or the property that helps pay for itself?</h1>
          <p style={heroTextStyle}>
            Compare a single-family home with an owner-occupied multi-family property, then capture leads from buyers who want help reviewing the numbers.
          </p>
        </div>
        <div style={heroCardStyle}>
          <div style={heroCardLabelStyle}>Quick takeaway</div>
          <div style={heroCardHeadlineStyle}>{investWins ? "Invest" : "Nest"}</div>
          <p style={heroCardTextStyle}>{recommendation}</p>
        </div>
      </section>

      <section style={bannerStyle}>
        <strong>Current recommendation:</strong>
        <span style={{ marginLeft: 8 }}>{recommendation}</span>
      </section>

      <section style={gridTwoStyle}>
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Nest: Single-Family Home</h2>
          <p style={sectionTextStyle}>A simpler lifestyle with more privacy, but no built-in rental offset.</p>
          <Field label="Purchase Price" value={nestPrice} setValue={setNestPrice} />
          <Field label="Down Payment %" value={nestDownPct} setValue={setNestDownPct} />
          <Field label="Interest Rate %" value={nestRate} setValue={setNestRate} />
          <Field label="Loan Term (Years)" value={nestTerm} setValue={setNestTerm} />
          <Field label="Property Tax Rate (% annually)" value={nestTaxRate} setValue={setNestTaxRate} />
          <Field label="Insurance Rate (% annually)" value={nestInsuranceRate} setValue={setNestInsuranceRate} />
          <Field label="Maintenance / Month" value={nestMaintenance} setValue={setNestMaintenance} />
          <Field label="HOA / Month" value={nestHoa} setValue={setNestHoa} />
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Invest: Multi-Family</h2>
          <p style={sectionTextStyle}>Live in one unit and use rent from the others to reduce your effective housing cost.</p>
          <Field label="Purchase Price" value={investPrice} setValue={setInvestPrice} />
          <Field label="Down Payment %" value={investDownPct} setValue={setInvestDownPct} />
          <Field label="Interest Rate %" value={investRate} setValue={setInvestRate} />
          <Field label="Loan Term (Years)" value={investTerm} setValue={setInvestTerm} />
          <Field label="Property Tax Rate (% annually)" value={investTaxRate} setValue={setInvestTaxRate} />
          <Field label="Insurance Rate (% annually)" value={investInsuranceRate} setValue={setInvestInsuranceRate} />
          <Field label="Maintenance / Month" value={investMaintenance} setValue={setInvestMaintenance} />
          <Field label="Rent from Other Unit(s)" value={investRent} setValue={setInvestRent} />
          <Field label="Vacancy %" value={investVacancyPct} setValue={setInvestVacancyPct} />
          <Field label="Reserve %" value={investReservePct} setValue={setInvestReservePct} />
        </section>
      </section>

      <section style={metricsGridStyle}>
        <MetricCard label="Nest monthly cost" value={formatCurrency(nest.totalMonthly)} helper="Your full monthly ownership cost" />
        <MetricCard label="Invest monthly cost" value={formatCurrency(invest.netMonthlyCost)} helper="After rental contribution" />
        <MetricCard
          label="Monthly difference"
          value={formatCurrency(monthlyDifference)}
          helper={investWins ? "Potential monthly savings with Invest" : "Potential monthly savings with Nest"}
        />
        <MetricCard
          label="Tenant subsidy"
          value={`${Math.max(0, invest.subsidyPct).toFixed(0)}%`}
          helper="Percent of ownership cost covered by rent"
        />
      </section>

      <section style={gridTwoStyle}>
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Nest Results</h2>
          <Result label="Cash to Close" value={formatCurrency(nest.down)} />
          <Result label="Loan Amount" value={formatCurrency(nest.loan)} />
          <Result label="Mortgage Payment" value={formatCurrency(nest.mortgage)} />
          <Result label="Taxes / Month" value={formatCurrency(nest.taxes)} />
          <Result label="Insurance / Month" value={formatCurrency(nest.insurance)} />
          <Result label="Total Monthly Cost" value={formatCurrency(nest.totalMonthly)} />
          <div style={calloutMutedStyle}>
            <strong>Pros:</strong> privacy, simpler ownership, easier day-to-day living.
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Invest Results</h2>
          <Result label="Cash to Close" value={formatCurrency(invest.down)} />
          <Result label="Loan Amount" value={formatCurrency(invest.loan)} />
          <Result label="Mortgage Payment" value={formatCurrency(invest.mortgage)} />
          <Result label="Taxes / Month" value={formatCurrency(invest.taxes)} />
          <Result label="Insurance / Month" value={formatCurrency(invest.insurance)} />
          <Result label="Total Monthly Cost" value={formatCurrency(invest.totalMonthly)} />
          <Result label="Net Rental Contribution" value={formatCurrency(invest.netRentContribution)} />
          <Result label="Effective Monthly Cost" value={formatCurrency(invest.netMonthlyCost)} />
          <Result label="Tenant Subsidy" value={`${Math.max(0, invest.subsidyPct).toFixed(0)}%`} />
          <div style={calloutMutedStyle}>
            <strong>Pros:</strong> lower effective cost, income offset, stronger wealth-building potential.
          </div>
        </section>
      </section>

<div style={leadIntroStyle}>
  <div style={eyebrowStyle}>Next Step</div>
  <h2 style={leadTitleStyle}>Want a personalized review of your scenario?</h2>
  <p style={leadTextStyle}>
    Enter your information below and I’ll follow up with a more tailored take on whether your numbers point toward Nest or Invest.
  </p>
</div>

<form onSubmit={handleLeadSubmit} style={leadFormStyle}>
  <div style={gridTwoStyle}>
    <div>
      <label
        htmlFor="lead-name"
        style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#334155", fontWeight: 600 }}
      >
        Full Name
      </label>
      <input
        id="lead-name"
        name="name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jane Buyer"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      />
    </div>

    <div>
      <label
        htmlFor="lead-email"
        style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#334155", fontWeight: 600 }}
      >
        Email Address
      </label>
      <input
        id="lead-email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="jane@example.com"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      />
    </div>
  </div>

  <div>
    <label
      htmlFor="lead-notes"
      style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#334155", fontWeight: 600 }}
    >
      What property or scenario are you considering?
    </label>
    <textarea
      id="lead-notes"
      name="notes"
      required
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Example: I’m comparing a duplex in Culver City with a single-family home nearby."
      rows={5}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        fontSize: "15px",
        boxSizing: "border-box",
        resize: "vertical",
        fontFamily: "Arial, sans-serif",
      }}
    />
  </div>

  <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
    Your information is only used so I can follow up about this scenario.
  </div>

  <button type="submit" style={buttonStyle}>
    {leadStatus === "submitting" ? "Submitting..." : "Request My Personalized Review"}
  </button>

  {leadStatus === "success" && (
    <div style={successStyle}>
      Thanks — your request was submitted successfully.
    </div>
  )}

  {leadStatus === "error" && (
    <div
      style={{
        background: "#fef2f2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        borderRadius: "12px",
        padding: "14px 16px",
      }}
    >
      Something went wrong. Please try again.
    </div>
  )}
</form>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  padding: "32px",
  maxWidth: "1200px",
  margin: "0 auto",
  background: "#f8fafc",
  minHeight: "100vh",
  color: "#0f172a",
};

const heroStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.3fr 0.7fr",
  gap: "24px",
  alignItems: "stretch",
  marginBottom: "24px",
};

const eyebrowStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#2563eb",
  marginBottom: "12px",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "46px",
  lineHeight: 1.1,
  margin: "0 0 12px",
};

const heroTextStyle: React.CSSProperties = {
  fontSize: "18px",
  lineHeight: 1.6,
  color: "#475569",
  maxWidth: "760px",
  margin: 0,
};

const heroCardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  color: "white",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
};

const heroCardLabelStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "12px",
};

const heroCardHeadlineStyle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: 700,
  marginBottom: "8px",
};

const heroCardTextStyle: React.CSSProperties = {
  margin: 0,
  lineHeight: 1.6,
  color: "#e2e8f0",
};

const bannerStyle: React.CSSProperties = {
  background: "#eef6ff",
  padding: "18px 20px",
  borderRadius: "14px",
  marginBottom: "28px",
  border: "1px solid #cfe3ff",
};

const successStyle: React.CSSProperties = {
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  borderRadius: "12px",
  padding: "14px 16px",
};

const gridTwoStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
};

const gridThreeStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "24px",
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "16px",
  margin: "28px 0",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #d9e2ec",
  borderRadius: "18px",
  padding: "22px",
  background: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "8px",
  fontSize: "26px",
};

const sectionTextStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#64748b",
  lineHeight: 1.5,
};

const calloutMutedStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "14px",
  borderRadius: "12px",
  background: "#f8fafc",
  color: "#475569",
};

const leadSectionStyle: React.CSSProperties = {
  marginTop: "32px",
  background: "#ffffff",
  border: "1px solid #d9e2ec",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const leadIntroStyle: React.CSSProperties = {
  marginBottom: "18px",
};

const leadTitleStyle: React.CSSProperties = {
  fontSize: "32px",
  margin: "0 0 10px",
};

const leadTextStyle: React.CSSProperties = {
  margin: 0,
  color: "#64748b",
  lineHeight: 1.6,
  maxWidth: "760px",
};

const leadFormStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const buttonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: 0,
  borderRadius: "12px",
  padding: "14px 20px",
  fontSize: "16px",
  fontWeight: 700,
  cursor: "pointer",
  width: "fit-content",
  boxShadow: "0 6px 16px rgba(37, 99, 235, 0.25)",
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
      <label style={{ display: "block", fontSize: "14px", marginBottom: "6px", color: "#334155", fontWeight: 600 }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value || 0))}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div style={{ ...cardStyle, padding: "18px" }}>
      <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 700, marginBottom: "6px" }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.5 }}>{helper}</div>
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
