import { Link } from "react-router-dom";
import phone from "../assets/phone.png";

const HeroSection = () => {
  return (
    <section className=" bg-mainBG relative flex items-center justify-center bg-gradient-to-r from-bgColor to-secondary h-screen text-white text-center px-4">
      {/* Background Decorative Waves */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full bg-gradient-to-r from-bgColor to-secondary"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="rgba(255, 255, 255, 0.1)"
            fillOpacity="1"
            d="M0,256L1440,160L1440,320L0,320Z"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="z-10 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Welcome to <span className="text-highlight">Pdes Cryptocurrency</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Revolutionizing digital trading and transactions. Fast, secure, and
          decentralized. Be part of the future of finance.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
          <Link
            to="/register"
            className="bg-bgColor hover:bg-sky-950 hover:bg-highlight-dark text-xl text-white py-3 px-8 rounded-lg shadow-lg"
          >
            Join Us
          </Link>
          <Link
            to="/login"
            className="bg-secondary hover:bg-secondary-dark text-xl text-white py-3 px-8 rounded-lg shadow-lg"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Image Section */}
      <div className="absolute right-8 bottom-8 md:bottom-16 md:right-16">
        <img
          src={phone}
          alt="Crypto Visual"
          className="w-64 md:w-80 object-contain"
        />
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="absolute inset-0 w-full h-full bottom-3"
        preserveAspectRatio="none"
      >
        {/* Define Gradient */}
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#00687E" />
            <stop offset="100%" stop-color="#D67D34" />
          </linearGradient>
        </defs>

        {/* Wave Path */}
        <path
          fill="url(#waveGradient)"
          fillOpacity="0.9"
          d="M0,256L80,234.7C160,213,320,171,480,165.3C640,160,800,192,960,197.3C1120,203,1280,181,1360,170.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </svg>
    </section>
  );
};

export default HeroSection;
