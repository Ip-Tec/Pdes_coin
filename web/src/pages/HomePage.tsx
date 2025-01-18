import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AboutContent from "../components/AboutContent";
import ParallaxEffect from "../components/ParallaxEffect";
import { FaUser, FaGraduationCap, FaMoneyBillWave } from "react-icons/fa";
import { FaGlobe, FaBolt, FaWallet, FaGlobeAmericas } from "react-icons/fa";
import HeroSection from "../components/HeroSection";
import Header from "../components/Header";

const HomePage: React.FC = () => {
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) {
      navigate("/dashboard");
    }
  });
  const features = [
    {
      title: "Decentralized Trading",
      description:
        "Experience trading without the need for intermediaries. Pdes empowers users by eliminating centralized authorities, allowing for peer-to-peer transactions that prioritize transparency and trust.",
      icon: <FaGlobe />, // React Icon for a globe
    },
    {
      title: "Fast and Secure Transactions",
      description:
        "Enjoy lightning-fast transaction speeds powered by our advanced network infrastructure. Security is at the heart of every transaction, ensuring your funds are always safe.",
      icon: <FaBolt />, // React Icon for a lightning bolt
    },
    {
      title: "Low Transaction Fees",
      description:
        "Save more with minimal transaction fees compared to traditional financial systems and other cryptocurrencies. Pdes ensures affordability for users across the globe.",
      icon: <FaWallet />, // React Icon for a wallet
    },
    {
      title: "Global Accessibility",
      description:
        "Pdes is accessible to anyone, anywhere in the world. Whether you're sending funds to a neighboring city or across continents, Pdes connects people with ease.",
      icon: <FaGlobeAmericas />, // React Icon for a globe with Americas
    },
  ];
  const partners = [
    {
      icon: <FaUser className="text-blue-500 text-9xl mb-4" />,
      title: "Individuals",
      description:
        "Empowering individuals to take full control of their finances with decentralized tools.",
    },
    {
      icon: <FaGraduationCap className="text-green-500 text-9xl mb-4" />,
      title: "Students",
      description:
        "Helping students achieve financial independence and manage their funds efficiently.",
    },
    {
      icon: <FaMoneyBillWave className="text-yellow-500 text-9xl mb-4" />,
      title: "Salary Earners",
      description:
        "Enabling salary earners to save, trade, and grow their assets seamlessly.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-mainBG">
      {/* Header Section */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Parallex effect*/}
      <ParallaxEffect />

      {/* About Section */}
      <AboutContent />

      <section className="we-work-with-section bg-gray-100 py-10">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold mb-8 text-gray-700">
            We Work With
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="partner-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="icon text-center flex items-center justify-center w-full m-auto">
                  {partner.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-2 text-gray-700">
                  {partner.title}
                </h3>
                <p className="text-gray-500 text-center">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Coin left */}
      <section className="coin-section py-10 px-2 text-center flex justify-center flex-col items-center text-secondary bg-bgColor">
        <p className="text-3xl font-semibold text-white ">
          Currently, there are{" "}
          <span className="text-secondary font-semibold">7,980,000,000</span>{" "}
          coins left.
        </p>
        <p className="text-3xl font-semibold text-white ">
          Join us in shaping the future of digital economy.
        </p>
      </section>
      <section
        className="features-section bg-gray-100 py-10 lg:h-screen"
        id="features"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold mb-8 text-gray-700">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="icon text-4xl text-blue-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-stone-800">
                  {feature.title}
                </h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="trading"
        className="py-16 px-6 bg-gradient-to-r from-bgColor to-secondary h-[45%] text-center"
      >
        <h2 className="text-3xl font-bold text-gray-200 mb-6">Trade Pdes</h2>
        <p className="text-lg text-gray-300">
          Trade Pdes coins on it Trade cent and be part of the revolution.
          Experience fast, secure, and transparent trading.
        </p>
      </section>

      <footer className="bg-gradient-to-r from-bgColor border-t-2 border-bgColor mt-1 to-secondary hover:bg-gradient-to-l text-white py-4 text-center">
        <p>© 2025 Pdes Cryptocurrency. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default HomePage;
