export default function AboutPage() {
  return (
    <div className="min-h-screen bg-wellinder-cream pt-20">

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 max-w-xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-wellinder-dark/40 block mb-4">About</span>
        <h1 className="text-4xl md:text-5xl font-serif italic text-wellinder-dark leading-tight">
          Real results<br />don't need<br />explaining.
        </h1>
      </section>

      {/* Divider */}
      <div className="px-6 max-w-xl mx-auto">
        <div className="border-t border-wellinder-dark/10" />
      </div>

      {/* Story */}
      <section className="px-6 py-14 max-w-xl mx-auto space-y-8 text-wellinder-dark/70 text-[15px] leading-[1.9]">

        <p>
          <span className="font-semibold text-wellinder-dark">WELLINDER began in Korea in 2023.</span>
        </p>

        <p>
          At a time when inner beauty was still often seen as something to simply believe in, we believed that the right ingredients — carefully chosen and precisely formulated — could make a real difference in people's lives.
        </p>

        <p>
          The successful launch of <span className="font-medium text-wellinder-dark italic">Maum Fore</span>, our stress supplement, reaffirmed that belief.
        </p>

        <div className="border-l-2 border-wellinder-dark/20 pl-5 py-1">
          <p className="text-wellinder-dark/60 italic text-[14px] leading-relaxed">
            We do not choose ingredients because they are trending. If an ingredient cannot support real, tangible change, we leave it out.
          </p>
        </div>

        <p>
          We consider each formula with great care — for changes that become clearer and more meaningful with time.
        </p>

      </section>

      {/* Bottom mark */}
      <div className="px-6 pb-20 max-w-xl mx-auto">
        <div className="border-t border-wellinder-dark/10 pt-8">
          <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-wellinder-dark/30">
            Wellinder — Seoul, Korea · 2023
          </p>
        </div>
      </div>

    </div>
  );
}
