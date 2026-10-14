import AboutUs from "./AboutUs/AboutUs";
import HeroSlider from "./HeroSlider/HeroSlider";
import MostLoved from "./MostLoved/MostLoved";
import PriceStartFrom from "./PriceStartFrom/PriceStartFrom";
import ServiceFeatures from "./ServiceFeatures/ServiceFeatures";

const HomePage = () => {
  return (
    <main>
      <HeroSlider />
      <PriceStartFrom />
      <ServiceFeatures />
      <MostLoved />
      <AboutUs />
    </main>
  );
};

export default HomePage;
