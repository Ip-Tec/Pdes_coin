// import { loadFull } from "tsparticles";
// import Particles from "react-tsparticles";
import { Link } from "react-router-dom";

function AboutContent() {
  // const particlesInit = async (engine: any) => {
  //   await loadFull(engine);
  // };
  return (
    <section
      id="about"
      className="relative py-16 px-6 bg-mainBG text-center h-screen overflow-hidden"
    >
      {/* Particle Background */}
      {/* <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#f3f4f6" } },
          fpsLimit: 80,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              resize: true,
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
            },
          },
          particles: {
            color: { value: "#d67d34" },
            links: {
              color: "#00687E",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: { enable: true },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: false,
              speed: 2,
              straight: false,
            },
            number: { value: 50, density: { enable: true, area: 800 } },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: 5, random: true },
          },
          detectRetina: true,
        }}
      /> */}

      {/* About Content */}
      <div className="flex flex-wrap items-center justify-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">About Pdes</h2>
        <p className="text-xl text-gray-600 mb-4 max-w-5xl mx-auto w-auto">
          Pdes is a cutting-edge cryptocurrency designed to redefine how digital
          transactions are conducted globally. With a total supply of 8 billion
          coins, Pdes focuses on creating a secure, efficient, and decentralized
          financial ecosystem. It is a revolutionary digital currency that
          enables seamless, near-instant payments with minimal transaction
          costs, making it accessible to users worldwide.
        </p>
        <p className="text-xl text-gray-600 mb-4 max-w-5xl mx-auto w-auto">
          At its core, Pdes leverages advanced cryptographic algorithms to
          ensure a robust and secure network, empowering users to maintain
          complete control over their finances without relying on intermediaries
          or centralized authorities. This decentralized approach fosters
          transparency, trust, and resilience, essential qualities in the
          rapidly evolving digital economy.
        </p>
      </div>
      <div className="flex justify-center mt-8">
        <Link
          to="/about"
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition duration-300"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
}

export default AboutContent;
