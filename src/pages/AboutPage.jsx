import { useContext } from 'react';
import { LangContext } from '../App';

export default function AboutPage() {
  const { lang } = useContext(LangContext);
  const isZh = lang === 'zh';

  return (
    <div className="min-h-screen bg-wellinder-cream pt-20">

      {/* Hero */}
      <section className="px-6 pt-12 pb-16 max-w-xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-wellinder-dark/40 block mb-4">About</span>
        <h1 className="text-2xl md:text-3xl font-serif italic text-wellinder-dark leading-tight">
          {isZh ? <>真实的改变，无需多言。</> : <>Real results don't need explaining.</>}
        </h1>
      </section>

      {/* Divider */}
      <div className="px-6 max-w-xl mx-auto">
        <div className="border-t border-wellinder-dark/10" />
      </div>

      {/* Story */}
      <section className="px-6 py-14 max-w-xl mx-auto space-y-8 text-wellinder-dark/70 text-[15px] leading-[1.9]">

        {isZh ? (
          <>
            <p>
              <span className="font-semibold text-wellinder-dark">威琳德于2023年在韩国创立。</span>
            </p>

            <p>
              彼时，内服美容仍被许多人视为"信则有效"的领域，但我们坚信——只要精心甄选原料，严谨调配配方，就能为人们的生活带来真实可见的改变。
            </p>

            <p>
              压力营养补充剂<span className="font-medium text-wellinder-dark italic">「心之森」</span>的成功上市，印证了这一信念。
            </p>

            <div className="border-l-2 border-wellinder-dark/20 pl-5 py-1">
              <p>
                我们从不因流行而选择原料。若某种原料无法带来真正的改变，我们会果断舍弃。
              </p>
            </div>

            <p>
              威琳德的每一种原料、每一个配方，都有其存在的理由。为了让改变随着时间流逝愈加清晰可感，我们每天都在用心打磨每一个配方。
            </p>
          </>
        ) : (
          <>
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
              <p>
                We do not choose ingredients because they are trending. If an ingredient cannot support real, tangible change, we leave it out.
              </p>
            </div>

            <p>
              We consider each formula with great care — for changes that become clearer and more meaningful with time.
            </p>
          </>
        )}

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
