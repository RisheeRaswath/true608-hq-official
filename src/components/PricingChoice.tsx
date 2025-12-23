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

  // LEAD CAPTURE LOGIC: Triggers a professional email inquiry
  const handleSecureSlot = (tierName: string) => {
    const subject = encodeURIComponent(`SECURE SLOT: ${tierName} for Jan 1st Mandate`);
    const body = encodeURIComponent(
      `Hello True608 Intelligence,\n\nI want to secure a slot for the ${tierName} before the Jan 1st price increase. Please send the compliance invoice and onboarding requirements for our fleet.\n\nCompany Name: \nContact Name: \nNumber of Trucks: \nPhone Number: `
    );
    window.location.href = `mailto:rishee@true608.com?subject=${subject}&body=${body}`;
  };

  const tiers = [
    {
      name: 'Standard Shield',
      price: '2,499',
      description: 'Single-site compliance for owner-operators.',
      features: [
        'Automated 40 CFR Part 84 Logging',
        'EPA Audit-Ready Reports',
        'Real-time HFC Tracking',
        'Email Support'
      ],
      cta: 'Secure Early Shield',
      highlight: false,
    },
    {
      name: 'Fleet Intelligence',
      price: '9,699',
      description: 'The Industry Standard for 10-40 Truck Fleets.',
      features: [
        'Everything in Standard',
        'Bulk Serialization Engine',
        'Technician Compliance HUD',
        '24/7 Rapid Response Support',
        'Multi-State Jurisdiction Mapping'
      ],
      cta: 'Reserve Fleet Slot',
      highlight: true,
    },
    {
      name: 'Enterprise Mandate',
      price: '19,699',
      description: 'Full-scale infrastructure for national providers.',
      features: [
        'Everything in Fleet',
        'Custom API Integrations',
        'On-site Implementation Guide',
        'Dedicated Compliance Officer',
        'Unlimited Historical Backups'
      ],
      cta: 'Initialize Enterprise Strike',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="bg-black py-24 text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* LIVE DOOMSDAY BANNER - PURE BLACK THEME */}
        <div className="inline-block bg-red-950/20 border border-red-500/30 rounded-2xl px-8 py-4 mb-12 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <p className="text-red-500 font-black text-xs tracking-widest uppercase mb-3">
            ⚠️ PHASE 1 PRICE LOCKDOWN EXPIRING IN:
          </p>
          <div className="flex gap-4 justify-center items-center font-mono text-3xl md:text-4xl font-black text-white">
            <div>{timeLeft.days}<span className="text-[10px] text-red-500 block uppercase font-bold font-sans mt-1">Days</span></div>
            <div className="pb-5 text-zinc-700">:</div>
            <div>{timeLeft.hours}<span className="text-[10px] text-red-500 block uppercase font-bold font-sans mt-1">Hrs</span></div>
            <div className="pb-5 text-zinc-700">:</div>
            <div>{timeLeft.minutes}<span className="text-[10px] text-red-500 block uppercase font-bold font-sans mt-1">Min</span></div>
            <div className="pb-5 text-zinc-700">:</div>
            <div>{timeLeft.seconds}<span className="text-[10px] text-red-500 block uppercase font-bold font-sans mt-1">Sec</span></div>
          </div>
        </div>

        <h2 className="text-5xl font-extrabold mb-4 text-blue-500 tracking-tight">
          FEDERAL COMPLIANCE PRICING
        </h2>
        <p className="text-xl mb-16 text-zinc-400 max-w-2xl mx-auto">
          Secure your HFC allocation tracking before the <span className="text-white font-bold underline underline-offset-4 decoration-blue-500">Jan 01, 2026</span> mandate.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`relative p-8 rounded-3xl border-2 transition-all duration-300 ${
                tier.highlight 
                ? 'border-blue-500 bg-zinc-900 scale-105 shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] z-10' 
                : 'border-zinc-800 bg-black opacity-90 hover:opacity-100'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                  Most Recommended
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-zinc-500 text-sm mb-6 h-10">{tier.description}</p>
              
              <div className="text-6xl font-black mb-8">
                <span className="text-2xl align-top text-zinc-600">$</span>
                {tier.price}
                <span className="text-base font-medium text-zinc-600 tracking-normal">/yr</span>
              </div>

              <ul className="text-left mb-10 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start text-sm text-zinc-300">
                    <span className="text-blue-500 mr-3 mt-1 font-bold">✓</span> {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSecureSlot(tier.name)}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-200 active:scale-95 ${
                  tier.highlight 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-sm italic">
            * All pricing in USD. Payments processed via Secure US ACH or Domestic Wire.
          </p>
          <div className="flex gap-4">
            <span className="bg-zinc-900 px-3 py-1 rounded text-[10px] text-zinc-500 font-mono tracking-tighter">EPA 40 CFR 84 COMPLIANT</span>
            <span className="bg-zinc-900 px-3 py-1 rounded text-[10px] text-zinc-500 font-mono tracking-tighter">ENCRYPTED DATA LOGGING</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;