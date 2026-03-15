import ExploreCategoriesSection from "../components/ExploreCategoriesSection";
import PopularCitiesSection from "../components/PopularCitiesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import SuggestedSection from "../components/SuggestedSection";
import FeedPage from "../../activity/pages/FeedPage";
import { useAuthContext } from "../../auth/context/AuthProvider";

export default function HomePage() {

  return (
    <div className="space-y-32">
    
     <ExploreCategoriesSection />
      {/* <PopularCitiesSection /> */}
      <HowItWorksSection />
      {/* <SuggestedSection /> */}
    </div>
  );
}
