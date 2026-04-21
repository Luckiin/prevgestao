import SiteHeader  from "@/components/site/SiteHeader";
import Hero        from "@/components/site/Hero";
import Areas       from "@/components/site/Areas";
import Sobre       from "@/components/site/Sobre";
import Depoimentos from "@/components/site/Depoimentos";
import Contato     from "@/components/site/Contato";
import SiteFooter  from "@/components/site/SiteFooter";

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: "#080102", color: "var(--ink-200)", overflowX: "hidden" }}>
      <SiteHeader />
      <Hero />
      <Areas />
      <Sobre />
      <Depoimentos />
      <Contato />
      <SiteFooter />
    </main>
  );
}
