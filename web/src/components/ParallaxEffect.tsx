const ParallaxEffect: React.FC = () => {
  return (
    <div>
      {/* Section 1 */}
      {/* <section className="h-screen flex items-center justify-center bg-gray-200">
        <h1 className="text-4xl font-bold">Welcome to Pdes</h1>
      </section> */}

      {/* Parallax Section */}
      <section
        className="h-screen bg-fixed bg-cover bg-center parallax-img"
      >
        <div className="h-full flex items-center justify-center bg-black bg-opacity-50">
          <h1 className="text-4xl font-bold text-white text-center">
            The Future of Cryptocurrency
          </h1>
        </div>
      </section>

      {/* Section 2 */}
      {/* <section className="h-screen flex items-center justify-center bg-gray-300">
        <h1 className="text-4xl font-bold">Join the Revolution</h1>
      </section> */}
    </div>
  );
};

export default ParallaxEffect;
