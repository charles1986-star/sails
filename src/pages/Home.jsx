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
import StatisticsBoard from "../components/StatisticsBoard";


export default function Home() {
  return (
    <>
      <Hero />
      <LandingSections />
      <StatisticsBoard />
      <SailsIntro />
      <ShopLandingSection />
      <MediaLandingSection />
      <GamesIntro />
      <Categories />
      
    </>
  );
}
