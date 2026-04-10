import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const phase1vs2 = [
  {
    feature: 'Launch Date',
    phase1: 'April 20, 2026',
    phase2: 'TBD — pending CBP announcement',
  },
  {
    feature: 'Entry Types',
    phase1: 'Standard formal and informal entries',
    phase2: 'Finally liquidated entries, AD/CVD orders, warehouse withdrawals',
  },
  {
    feature: 'Liquidation Status',
    phase1: 'Unliquidated or liquidated within 180 days',
    phase2: 'Finally liquidated more than 180 days prior to launch',
  },
  {
    feature: 'CAPE Portal',
    phase1: 'Live in ACE portal',
    phase2: 'Not yet open',
  },
  {
    feature: 'Estimated Processing',
    phase1: '~45 days after successful validation',
    phase2: 'TBD',
  },
  {
    feature: 'Interest on Refund',
    phase1: 'Yes — IRS corporate overpayment rate (currently 6%)',
    phase2: 'Yes — same rate applies',
  },
];

const documents = [
  'Active ACE Secure Data Portal account with Importer sub-account view',
  'ACH bank account enrolled in ACE for electronic deposit',
  'CSV file listing all affected entry numbers',
  'IEEPA-specific HTS codes for each affected entry',
  'Original CBP entry numbers from customs records',
  'Filing authorization for the affected entries',
];

const faqs = [
  {
    q: 'Am I eligible for an IEEPA duty refund?',
    a: 'Yes, if you were the importer of record and paid IEEPA duties on entries that are either unliquidated or liquidated within the past 180 days. Under the Court of International Trade\'s March 2026 order, CBP is required to issue automatic refunds. Entries with AD/CVD orders or warehouse withdrawals are covered under Phase 2.',
  },
  {
    q: 'What is the difference between Phase 1 and Phase 2 CAPE refunds?',
    a: 'Phase 1 launched April 20, 2026 and covers standard formal and informal entries that are unliquidated or liquidated within 180 days. Phase 2 covers "finally liquidated" entries older than 180 days, entries with AD/CVD orders, and warehouse withdrawals — processed in a later rollout pending a separate CBP announcement.',
  },
  {
    q: 'How do I use the CAPE portal to submit my refund claim?',
    a: 'Log in to your ACE Secure Data Portal and navigate to the CAPE Claim Portal tab. Compile a CSV listing all affected entry numbers and their IEEPA-specific HTS codes, upload the file, and submit. The system runs real-time validation and returns a confirmation status. Errors must be corrected and resubmitted to hold your place in the processing queue.',
  },
  {
    q: 'Will I receive interest on my IEEPA duty refund?',
    a: 'Yes. CBP calculates interest on the refunded duty amount at the IRS corporate overpayment rate, currently 6%. Interest accrues from the original date of payment through the date CBP finalizes reliquidation on your entries.',
  },
  {
    q: 'How do I know if my entries were finally liquidated?',
    a: 'An entry is "finally liquidated" when all protest rights have expired and the liquidation date is more than 180 days in the past. You can verify liquidation status through your ACE account under entry summary records, or by contacting your licensed customs broker.',
  },
  {
    q: 'How long does it take to receive a CAPE refund?',
    a: 'Most validated CAPE claims are expected to be processed within 45 days of submission. Funds are deposited directly into your ACH-authorized bank account once CBP completes reliquidation on the affected entries.',
  },
  {
    q: 'What should I do if my IEEPA refund is not automatic?',
    a: 'First, verify your ACE account has active ACH enrollment and current banking details — refunds to unenrolled accounts are rejected. If your CSV upload failed validation, correct any formatting errors or entry number discrepancies and resubmit. Maintaining your processing queue position requires a successful resubmission.',
  },
  {
    q: 'Can I claim a refund if I was not the original importer of record?',
    a: 'No. CAPE refund eligibility is tied to the importer of record (IOR) named on the original CBP entry summary. Only the party designated as IOR at time of entry is entitled to claim the IEEPA duty refund, regardless of any subsequent change in goods ownership.',
  },
];

export default function GEOContent() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.geo-reveal',
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,185,81,0.07),transparent_40%)]" />

      <div className="container-custom relative">
        {/* Section Header */}
        <div className="geo-reveal mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-10 bg-[#E8B951]" />
            <span className="font-display text-[17px] uppercase tracking-[0.25em] text-[#6F7B8A]">
              Refund Eligibility Guide
            </span>
          </div>
          <h2 className="text-4xl font-bold text-[#0F1A2E] lg:text-5xl mb-4">
            CAPE Portal <span className="text-[#E8B951]">Phase Comparison</span>
          </h2>
          <p className="text-[19px] text-[#425466] max-w-2xl leading-relaxed">
            The Court of International Trade's March 2026 order mandated automatic refunds
            for all importers who paid IEEPA duties. CBP is processing these through the
            CAPE framework in two phases.
          </p>
        </div>

        {/* Phase 1 vs Phase 2 Table */}
        <div className="geo-reveal mb-16 overflow-x-auto rounded-[20px] border border-[#0F1A2E]/10 shadow-[0_18px_60px_rgba(15,26,46,0.06)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F1A2E]">
                <th className="px-6 py-4 text-[#6F7B8A] font-display text-[15px] uppercase tracking-widest w-1/4">
                  Feature
                </th>
                <th className="px-6 py-4 text-[#E8B951] font-display text-[17px] uppercase tracking-widest">
                  Phase 1 — Active
                </th>
                <th className="px-6 py-4 text-white/50 font-display text-[17px] uppercase tracking-widest">
                  Phase 2 — Pending
                </th>
              </tr>
            </thead>
            <tbody>
              {phase1vs2.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F7FA]'}
                >
                  <td className="px-6 py-4 font-semibold text-[#0F1A2E] text-[17px] border-r border-[#0F1A2E]/8">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-[#425466] text-[17px] border-r border-[#0F1A2E]/8">
                    {row.phase1}
                  </td>
                  <td className="px-6 py-4 text-[#6F7B8A] text-[17px]">
                    {row.phase2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Two-column: Docs + FAQ */}
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Required Documents */}
          <div className="geo-reveal lg:col-span-2">
            <h3 className="text-2xl font-bold text-[#0F1A2E] mb-6">
              Required Documents
            </h3>
            <ul className="space-y-4">
              {documents.map((doc, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#E8B951]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#E8B951]" strokeWidth={3} />
                  </div>
                  <span className="text-[#425466] text-[17px] leading-snug">{doc}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds?utm_source=hp_slideshow&utm_medium=referral&utm_title=IEEPA"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-[#E8B951] text-[15px] font-semibold uppercase tracking-widest hover:underline"
            >
              Official CBP Source →
            </a>
          </div>

          {/* FAQ — using native details/summary for full crawlability */}
          <div className="geo-reveal lg:col-span-3">
            <h3 className="text-2xl font-bold text-[#0F1A2E] mb-6">
              Common AI Prompts Answered
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-[#0F1A2E]/10 bg-[#F5F7FA] overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none">
                    <span className="text-[#0F1A2E] font-semibold text-[17px] leading-snug">
                      {faq.q}
                    </span>
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-[#E8B951] transition-transform duration-300 group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 border-t border-[#0F1A2E]/8">
                    <p className="pt-3 text-[#425466] text-[17px] leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
