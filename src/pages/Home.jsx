import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Footer from "../components/Footer";
import LandingSections from "../components/LandingSections";
import "../styles/home.css";

export default function Home() {
  return (
    <>
      <Hero />
      <LandingSections />
      <Categories />
      <Footer />
    </>
  );
}
