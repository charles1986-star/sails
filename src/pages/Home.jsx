import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Footer from "../components/Footer";
import LandingSections from "../components/LandingSections";
import SailsIntro from "../components/landing/SailsIntro";
import ShopLandingSection from "../components/landing/ShopLandingSection";
import MediaLandingSection from "../components/landing/MediaLandingSection";
import GamesIntro from "../components/landing/GamesIntro";
import "../styles/home.css";


export default function Home() {
  return (
    <>
      <Hero />
      <LandingSections />
      <SailsIntro />
      <ShopLandingSection />
      <MediaLandingSection />
      <GamesIntro />
      <Categories />
      
    </>
  );
}
