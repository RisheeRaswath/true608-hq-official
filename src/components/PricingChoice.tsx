import React, { useState, useEffect } from 'react';

const PricingSection = () => {
  // COUNTDOWN LOGIC: The Jan 01, 2026 Doomsday Clock
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('January 1, 2026 00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // LEAD CAPTURE: Direct link to your Zoho inbox
  const handleSecureSlot = (tierName: string) => {
    const subject = encodeURIComponent(`SECURE SLOT: ${tierName} for Jan 1st Mandate`);
    const body = encodeURIComponent(
      `Hello True608 Intelligence,\n\nI want to secure a slot for the ${tierName} before the Jan 1st price increase. Please send the compliance invoice and onboarding requirements for our fleet.\n\nCompany Name: \nContact Name: \nNumber of Trucks: \nPhone Number: `
    );
    window.location.href = `mailto:rishee@true608.com?subject=${subject}&body=${body}`;
  };

  // WEAPONIZED TIERS: Updated for maximum psychological impact
  const tiers = [
    {
      name: 'Standard Shield',
      price: '2,499',
      description: 'Essential compliance for owner-operators and local contractors.',
      features: [
        'Automated 40 CFR 84 Logging',
        'EPA Audit-Ready Reports',
        'Real-time HFC Tracking',
        'Federal Audit Defense Support' // Upgraded from "Email Support"
      ],
      cta: 'Secure Shield',
      highlight: false,
    },
    {
      name: 'Fleet Intelligence',
      price: '9,699',
      description: 'The Gold Standard for 10-40 Truck Fleets. Total oversight.',
      features: [
        'Bulk Serialization Engine',
        'Technician Compliance HUD',
        'Fleet-Wide Liability Lockdown', // Upgraded
        'Multi-State Jurisdiction Mapping'
      ],
      cta: 'Reserve Fleet Slot',
      highlight: true,
    },
    {
      name: 'Enterprise Mandate',
      price: '19,699',
      description: 'National infrastructure for high-volume enterprise providers.',
      features: [
        'Custom API Integrations',
        'Dedicated Compliance Officer',
        'On-site Implementation Guide',
        'Indemnity Data Vault (10yr)' // Upgraded
      ],
      cta: 'Initialize Strike',
      highlight: false,
    },
  ];

  return (
    // ID MATCHES NAVBAR | scroll-mt-20 ACCOUNTS FOR STICKY HEADER
    <section id="the-shield" className="bg-black py-12 text-white font-sans scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* COMPACT TIMER BANNER */}
        <div className="inline-block bg-red-950/20 border border-red-500/30 rounded-xl px-6 py-2 mb-8 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <p className="text-red-500 font-black text-[10px] tracking-widest uppercase mb-1">
            ⚠️ PHASE 1 PRICE LOCKDOWN EXPIRING IN:
          </p>
          <div className="flex gap-4 justify-center items-center font-mono text-2xl md:text-3xl font-black text-white">
            <div>{timeLeft.days}<span className="text-[8px] text-red-500 block uppercase font-bold font-sans">Days</span></div>
            <div className="pb-4 text-zinc-700">:</div>
            <div>{timeLeft.hours}<span className="text-[8px] text-red-500 block uppercase font-bold font-sans">Hrs</span></div>
            <div className="pb-4 text-zinc-700">:</div>
            <div>{timeLeft.minutes}<span className="text-[8px] text-red-500 block uppercase font-bold font-sans">Min</span></div>
            <div className="pb-4 text-zinc-700">:</div>
            <div>{timeLeft.seconds}<span className="text-[8px] text-red-500 block uppercase font-bold font-sans">Sec</span></div>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold mb-2 text-blue-500 tracking-tight uppercase">
          Federal Compliance
        </h2>
        <p className="text-sm mb-10 text-zinc-500 max-w-2xl mx-auto">
          Secure HFC allocation tracking before the <span className="text-white font-bold underline decoration-blue-500">Jan 01, 2026</span> mandate.
        </p>
        
        {/* PRICING GRID */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`flex flex-col relative p-6 rounded-2xl border transition-all duration-300 ${
                tier.highlight 
                ? 'border-blue-500 bg-zinc-900 scale-105 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] z-10' 
                : 'border-zinc-800 bg-black'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Recommended
                </div>
              )}

              <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">{tier.name}</h3>
              <p className="text-zinc-500 text-[10px] mb-4 min-h-[32px]">{tier.description}</p>
              
              <div className="text-5xl font-black mb-6">
                <span className="text-xl align-top text-zinc-600">$</span>
                {tier.price}
                <span className="text-xs font-medium text-zinc-600">/yr</span>
              </div>

              <ul className="text-left mb-8 space-y-3 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start text-[11px] text-zinc-300 leading-snug">
                    <span className="text-blue-500 mr-2 font-bold shrink-0">✓</span> {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSecureSlot(tier.name)}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase transition-all duration-200 active:scale-95 mt-auto ${
                  tier.highlight 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-[10px] italic">
            * All pricing in USD. Payment via Secure US ACH or Domestic Wire.
          </p>
          <div className="flex gap-3">
            <span className="bg-zinc-900 px-2 py-1 rounded text-[8px] text-zinc-500 font-mono tracking-tighter">EPA 40 CFR 84 COMPLIANT</span>
            <span className="bg-zinc-900 px-2 py-1 rounded text-[8px] text-zinc-500 font-mono tracking-tighter">AES-256 DATA LOGGING</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;