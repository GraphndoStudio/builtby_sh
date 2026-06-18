import { getPortfolioContent } from "@/lib/content-store";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getPortfolioContent();
  return <PortfolioPage content={content} />;
}
