import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Constants ─────────────────────────────────────────────────────────────────

const STRIPE_LINK = 'https://buy.stripe.com/eVqbJ02WldNqbrSe9Kdwc0t';
const MAX_FREE = 3;

const COUNTRIES = [
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
];

const SYSTEM_PROMPT = `You are a US customs and tariff expert with complete knowledge of the 2026 HTS and current trade policies.

KEY 2026 TARIFF FACTS:
- Section 122 Temporary Import Surcharge: 5% on most imports, effective Feb 24 2026. Does NOT apply to USMCA-qualifying goods from Canada/Mexico, or goods already subject to Section 232 at 25%+ or Section 301 at 25%+.
- IEEPA tariffs: Suspended Feb 24 2026 per CSMS #67834313.
- Section 301 China tariffs: List 1/2/3 at 25%, List 4A at 7.5% (some at 25%). Fully active.
- Section 232 steel: 25% on most countries. Aluminum: 10-25%.
- Section 232 semiconductors/SME: Active per Jan 15 2026 EO.
- USMCA: Canada/Mexico qualifying goods generally free.
- FTAs active: USMCA, KORUS, Israel FTA, CAFTA-DR, Chile, Singapore, Peru, Colombia, Panama, Bahrain, Oman, Morocco, Australia FTA.

Respond ONLY with a valid JSON object, no markdown or preamble:
{
  "htsCode": "XXXX.XX.XXXX",
  "productDescription": "Official HTS short description",
  "chapter": "Chapter XX — Description",
  "generalRate": "X.X%",
  "baseRateDecimal": 0.0,
  "additionalTariffs": [
    { "name": "Section 301 (List 1)", "rate": "25%", "rateDecimal": 0.25, "applies": true, "note": "China only" }
  ],
  "additionalRateDecimal": 0.0,
  "totalRateDecimal": 0.0,
  "totalRateDisplay": "XX.X%",
  "ftaEligible": false,
  "ftaName": null,
  "ftaRate": null,
  "ftaNote": null,
  "confidence": "high",
  "disclaimer": "",
  "notes": []
}`;

// ── Helper Components ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: 'white',
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

interface RateRowProps {
  icon: string;
  label: string;
  rate: string;
  note?: string;
  highlight?: boolean;
  color?: string;
}

function RateRow({ icon, label, rate, note, highlight, color = '#6366f1' }: RateRowProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 12px', borderRadius: 8,
      background: highlight ? `${color}10` : 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: highlight ? 600 : 400, color: '#1e293b' }}>{label}</div>
          {note && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{note}</div>}
        </div>
      </div>
      <div style={{
        background: `${color}15`, color,
        border: `1px solid ${color}30`,
        padding: '3px 10px', borderRadius: 6,
        fontSize: highlight ? 14 : 13, fontWeight: highlight ? 700 : 600,
        fontVariantNumeric: 'tabular-nums',
      }}>{rate}</div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function MetricCard({ label, value, sub, accent }: MetricCardProps) {
  return (
    <div style={{
      background: accent ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'white',
      borderRadius: 12, padding: '14px 16px',
      border: accent ? 'none' : '1px solid #e2e8f0',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: accent ? 'rgba(255,255,255,0.75)' : '#94a3b8', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent ? 'white' : '#0f172a', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: accent ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdditionalTariff {
  name: string;
  rate: string;
  rateDecimal: number;
  applies: boolean;
  note?: string;
}

interface TariffResult {
  htsCode: string;
  productDescription: string;
  chapter: string;
  generalRate: string;
  baseRateDecimal: number;
  additionalTariffs: AdditionalTariff[];
  additionalRateDecimal: number;
  totalRateDecimal: number;
  totalRateDisplay: string;
  ftaEligible: boolean;
  ftaName: string | null;
  ftaRate: string | null;
  ftaNote: string | null;
  confidence: 'high' | 'medium' | 'low';
  disclaimer: string;
  notes: string[];
  dutyAmount?: string;
  landedCost?: string;
  shipmentValue?: number;
}

// ── Main Component ─────────────────────────────────────────────────────────────

const examples = ['Bicycles', 'Steel pipe', 'Laptop', 'Cotton T-shirts', 'Solar panels'];

export default function Quote() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Tariff simulator state
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('CN');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TariffResult | null>(null);
  const [error, setError] = useState('');
  const [lookups, setLookups] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [visible, setVisible] = useState(false);

  const remaining = MAX_FREE - lookups;
  const sel = COUNTRIES.find(c => c.code === country)!;

  const handleCalculate = async () => {
    if (!query.trim()) return;
    if (lookups >= MAX_FREE) { setShowPaywall(true); return; }
    setLoading(true); setError(''); setResult(null); setVisible(false);
    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Product: "${query.trim()}"\nCountry of Origin: ${sel.name} (${country})\nShipment Value: $${parseFloat(value) || 0} USD\n\nClassify and compute full 2026 tariff breakdown. Return JSON only.`,
          }],
        }),
      });
      const data = await resp.json();
      const text = (data.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('parse error');
      const parsed: TariffResult = JSON.parse(match[0]);
      const shipVal = parseFloat(value) || 0;
      if (shipVal > 0) {
        parsed.dutyAmount = (shipVal * parsed.totalRateDecimal).toFixed(2);
        parsed.landedCost = (shipVal + parseFloat(parsed.dutyAmount)).toFixed(2);
        parsed.shipmentValue = shipVal;
      }
      setResult(parsed);
      setLookups(l => {
        const next = l + 1;
        if (next >= MAX_FREE) setTimeout(() => setShowPaywall(true), 2800);
        return next;
      });
      setTimeout(() => setVisible(true), 30);
    } catch {
      setError('Analysis failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        .tariff-result-enter { animation: slideUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        .tariff-calc-btn { transition: all 0.18s ease; }
        .tariff-calc-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,102,241,0.38); }
        .tariff-calc-btn:active:not(:disabled) { transform: scale(0.98); }
        .tariff-inp { transition: border-color 0.2s,box-shadow 0.2s; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 11px 14px; font-size: 14px; width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.1); color: white; font-family: inherit; }
        .tariff-inp:focus { outline: none; border-color: #E8B951; box-shadow: 0 0 0 3px rgba(232,185,81,0.18); }
        .tariff-inp::placeholder { color: rgba(255,255,255,0.4); }
        .tariff-inp option { background: #0F1A2E; color: white; }
        .tariff-pill-btn { transition: all 0.15s; background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 5px 12px; font-size: 12px; cursor: pointer; color: rgba(255,255,255,0.7); font-family: inherit; }
        .tariff-pill-btn:hover { border-color: #E8B951; color: #E8B951; background: rgba(232,185,81,0.1); }
      `}</style>

      <section
        ref={sectionRef}
        className="relative min-h-screen flex items-center py-20 overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}quote-bg.jpg`}
            alt="Port background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0F1A2E]/80" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left - Text Content */}
            <div className="text-white pt-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-[2px] bg-[#E8B951]" />
                <span className="text-[#E8B951] font-display text-[17px] tracking-widest uppercase">
                  Tariff Simulator
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Calculate your <span className="text-[#E8B951]">Tariff</span>
              </h2>

              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Safe and Secure — we never collect your information.
                Calculate import duties, Section 301 tariffs, and
                landed costs for any product from any country.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#E8B951]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#E8B951] font-display font-bold">01</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg mb-1">Instant Results</h4>
                    <p className="text-white/60 text-[17px]">
                      Get a full HTS breakdown and effective duty rate in seconds
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#E8B951]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#E8B951] font-display font-bold">02</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg mb-1">Section 301 & 232</h4>
                    <p className="text-white/60 text-[17px]">
                      Full coverage of additional tariffs including Section 301 China duties
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#E8B951]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#E8B951] font-display font-bold">03</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg mb-1">Landed Cost Estimate</h4>
                    <p className="text-white/60 text-[17px]">
                      Enter your shipment value to see total duty amount and landed cost
                    </p>
                  </div>
                </div>
              </div>

              {/* Example pills */}
             {!result && !loading && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: 44, marginBottom: 12, animation: 'float 4s ease-in-out infinite' }}>🌐</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Safe and Secure — we do not collect your information.</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Enter a product name, HTS code, or keyword to get started.</div>
                </div>
              )}

            </div>

            {/* Right - Tariff Form */}
            <div ref={formRef}>
              {/* Tariff Simulator Embed */}
              <iframe
                src="https://tariffsimulator.vercel.app/"
                style={{
                  width: '100%',
                  height: 700,
                  border: 'none',
                  borderRadius: 18,
                  boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
                }}
                title="Tariff Simulator"
              />
              {/* Input Card - hidden */}
              <div style={{ display: 'none' }}>
                {/* Lookup counter */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: lookups >= MAX_FREE ? 'rgba(239,68,68,0.1)' : 'rgba(232,185,81,0.1)',
                    border: `1px solid ${lookups >= MAX_FREE ? 'rgba(239,68,68,0.3)' : 'rgba(232,185,81,0.3)'}`,
                    borderRadius: 20, padding: '5px 13px', fontSize: 12, fontWeight: 500,
                    color: lookups >= MAX_FREE ? '#ef4444' : '#E8B951',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: i < lookups ? (lookups >= MAX_FREE ? '#ef4444' : '#E8B951') : 'rgba(255,255,255,0.2)',
                        transition: 'background 0.4s',
                      }} />
                    ))}
                    <span>{lookups >= MAX_FREE ? 'Limit reached' : `${remaining} free lookup${remaining !== 1 ? 's' : ''} left`}</span>
                  </div>
                </div>

                {/* Product input */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>
                    Product Name or HTS Code
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
                    <input
                      className="tariff-inp"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCalculate()}
                      placeholder="e.g. Bicycle, Steel pipe, Laptop, 8471.30..."
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                {/* Country + Value */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>
                      Country of Origin
                    </label>
                    <select className="tariff-inp" value={country} onChange={e => setCountry(e.target.value)} style={{ cursor: 'pointer' }}>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>
                      Shipment Value (USD) — optional
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}>$</span>
                      <input className="tariff-inp" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="50,000" style={{ paddingLeft: 26 }} />
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  className="tariff-calc-btn"
                  onClick={handleCalculate}
                  disabled={loading || !query.trim()}
                  style={{
                    width: '100%', padding: '13px',
                    background: (!query.trim() || loading) ? 'rgba(232,185,81,0.35)' : 'linear-gradient(135deg,#E8B951,#d4a73d)',
                    color: (!query.trim() || loading) ? 'rgba(255,255,255,0.5)' : '#0F1A2E',
                    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: (!query.trim() || loading) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? <><Spinner /> Analyzing tariff schedule…</> : lookups >= MAX_FREE ? '🔒 Unlock Unlimited Access' : 'Calculate Tariffs →'}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '11px 14px', marginBottom: 16, fontSize: 13, color: '#fca5a5' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Results */}
              {result && (
                <div className={visible ? 'tariff-result-enter' : ''} style={{ opacity: visible ? 1 : 0 }}>
                  {/* Header */}
                  <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99,102,241,0.13)', borderRadius: '18px 18px 0 0', padding: '22px 24px 18px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 5 }}>HTS {result.htsCode}</div>
                        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 3, color: '#0f172a' }}>{result.productDescription}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{result.chapter}</div>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg,#E8B951,#d4a73d)', borderRadius: 14, padding: '12px 20px', textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: 'rgba(15,26,46,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Rate</div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: '#0F1A2E', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{result.totalRateDisplay}</div>
                        <div style={{ fontSize: 10, color: 'rgba(15,26,46,0.5)' }}>effective duty</div>
                      </div>
                    </div>
                  </div>

                  {/* Rate Breakdown */}
                  <div style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(99,102,241,0.13)', borderTop: 'none', padding: '18px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Rate Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <RateRow icon="📋" label="Base MFN Rate (Column 1 General)" rate={result.generalRate} color="#6366f1" />
                      {(result.additionalTariffs || []).filter(t => t.applies).map((t, i) => (
                        <RateRow key={i} icon="⚡" label={t.name} rate={t.rate} note={t.note} color="#f59e0b" />
                      ))}
                      <div style={{ borderTop: '1.5px solid rgba(99,102,241,0.12)', marginTop: 6, paddingTop: 6 }}>
                        <RateRow icon="⚖️" label="Total Effective Rate" rate={result.totalRateDisplay} color="#6366f1" highlight />
                      </div>
                    </div>
                    {result.ftaEligible && result.ftaName && (
                      <div style={{ marginTop: 14, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>✅</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{result.ftaName} eligible — rate may be {result.ftaRate}</div>
                          {result.ftaNote && <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{result.ftaNote}</div>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cost Calculation */}
                  {result.shipmentValue && result.shipmentValue > 0 && (
                    <div style={{ background: 'rgba(248,250,255,0.95)', border: '1px solid rgba(99,102,241,0.13)', borderTop: 'none', padding: '18px 20px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Cost Calculation</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
                        <MetricCard label="Shipment Value" value={`$${Number(result.shipmentValue).toLocaleString()}`} sub="FOB value" />
                        <MetricCard label="Estimated Duty" value={`$${Number(result.dutyAmount).toLocaleString()}`} sub={`at ${result.totalRateDisplay}`} accent />
                        <MetricCard label="Est. Landed Cost" value={`$${Number(result.landedCost).toLocaleString()}`} sub="Excl. freight/insurance" />
                      </div>
                    </div>
                  )}

                  {/* Footer notes */}
                  <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(99,102,241,0.13)', borderTop: 'none', borderRadius: '0 0 18px 18px', padding: '14px 20px 18px' }}>
                    {(result.notes || []).map((n, i) => (
                      <div key={i} style={{ display: 'flex', gap: 7, fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                        <span style={{ color: '#6366f1', flexShrink: 0 }}>ℹ</span><span>{n}</span>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: '#b0bec5', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: 10, marginTop: 6 }}>
                      Confidence: <strong style={{ color: result.confidence === 'high' ? '#059669' : result.confidence === 'medium' ? '#d97706' : '#dc2626' }}>{(result.confidence || '').toUpperCase()}</strong>
                      {result.disclaimer ? ` — ${result.disclaimer}` : ''} Verify with a licensed customs broker or USITC before compliance decisions.
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
                          </div>

          </div>
        </div>
      </section>

      {/* Paywall Modal */}
      {showPaywall && (
        <div
          onClick={e => e.target === e.currentTarget && setShowPaywall(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ background: 'white', borderRadius: 22, padding: '38px 36px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 28px 60px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>3 free lookups used</h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65, margin: '0 0 26px' }}>
              Unlock unlimited tariff calculations with full HTS coverage, Section 301 breakdowns, and landed cost estimates.
            </p>
            <a
              href={STRIPE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', background: 'linear-gradient(135deg,#E8B951,#d4a73d)', color: '#0F1A2E', padding: '13px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, marginBottom: 10 }}
            >
              Unlock Unlimited Access →
            </a>
            <button
              onClick={() => setShowPaywall(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
