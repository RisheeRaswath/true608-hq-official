import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection"; 
import RiskCalculator from "@/components/RiskCalculator";
import PDFSection from "@/components/PDFSection";
import PricingChoice from "@/components/PricingChoice";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black selection:bg-primary/30">
      <Navbar />
      <main>
        <HeroSection />
        
        <RiskCalculator />
        <PDFSection />
        <PricingChoice />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;