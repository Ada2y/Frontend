import Tailark from './_components/Tailark';
import FeatureCards from './_components/FeatureCards';
import {SchoolsClubsCarousel} from './_components/AiToolsCarousel';
import PreFooterFeatures from './_components/PreFooterFeatures';
import Pricing from './_components/Pricing';
import Faq from './_components/Faq';

export default function Home() {
  return (
    <>
      <Tailark />
      <main className="min-h-screen bg-[#212121] text-white">
        {/* Features section hidden temporarily */}
        {/* <section id="features" className="bg-black py-32 px-6 scroll-mt-24 md:px-12 md:scroll-mt-28">...</section> */}

        {/* Ecosystem section hidden temporarily */}
        {/* <section id="for-who" className="relative scroll-mt-24 overflow-hidden border-t border-white/10 bg-black py-32 px-6 md:px-12 md:scroll-mt-28">...</section> */}

        <section id="features" className="scroll-mt-24">
          <FeatureCards />
        </section>
        <section id="solutions" className="scroll-mt-24">
          <SchoolsClubsCarousel />
        </section>
        <section id="highlights" className="scroll-mt-24">
          <PreFooterFeatures />
        </section>
        <section id="pricing" className="scroll-mt-24">
          <Pricing />
        </section>
        <section id="faq" className="scroll-mt-24">
          <Faq />
        </section>
      </main>
    </>
  );
}
