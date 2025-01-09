import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NavigationBar from "../components/NavigationBar";
import { FaArrowLeft } from "react-icons/fa";

const AboutPage: React.FC = () => {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 mt-10 mb-28">
      {/* Show navbar if the user is logged in */}
      {!isAuth && <Header />}

      {/* Back Button */}
      <button
        className="flex items-center text-primary mb-4 md:hidden"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">
          About Pdes Cryptocurrency
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Pdes is a cutting-edge cryptocurrency designed to redefine how digital
          transactions are conducted globally. With a total supply of{" "}
          <strong>8 billion coins</strong>, Pdes focuses on creating a secure,
          efficient, and decentralized financial ecosystem. It is an
          open-source, peer-to-peer digital currency that enables seamless,
          near-instant payments with minimal transaction costs, making it
          accessible to users worldwide.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">
          Why Choose Pdes?
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            Leverages advanced cryptographic algorithms for a robust and secure
            network.
          </li>
          <li>
            Empowers users with complete control over their finances without
            intermediaries.
          </li>
          <li>Near-instant transaction speeds with minimal costs.</li>
          <li>
            Addresses scalability issues common in other cryptocurrencies.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">
          Empowering Global Trade and Commerce
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Pdes actively supports global trade and commerce by providing a
          versatile platform that integrates seamlessly with major
          cryptocurrency exchanges. This ensures <strong>high liquidity</strong>{" "}
          and <strong>broad accessibility</strong>, making Pdes a powerful tool
          for financial inclusion and economic empowerment.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">
          Vision for the Future
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          As part of its vision, Pdes aims to make digital currency a
          universally accepted medium of exchange. With a limited supply of{" "}
          <strong>8 billion coins</strong>, its value is carefully managed to
          promote sustainability and long-term growth. This presents an
          opportunity for early adopters and investors to join this
          revolutionary movement.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">
          Join the Revolution
        </h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Pdes isn’t just a cryptocurrency; it’s a mission to democratize
          finance and create a future where digital assets are accessible to
          everyone, everywhere. Whether you're looking to trade, invest, or
          experience the power of decentralized technology, Pdes offers a
          reliable, innovative, and forward-thinking solution for the modern
          economy.
        </p>

        {/* Disclaimer Section */}
        <div className="mt-8 p-6 bg-yellow-100 border border-yellow-500 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4">
            Disclaimer
          </h3>
          <p className="text-gray-700 mb-4">
            Cryptocurrency investments carry a high risk. There is a significant
            chance that you may lose all or part of your investment. The value
            of digital assets can be volatile, and Pdes cannot guarantee any
            financial returns. Users are solely responsible for their decisions
            to invest, trade, or hold Pdes coins. We will not be held
            responsible for any financial losses, damages, or consequences
            resulting from your participation in the Pdes ecosystem.
          </p>
          <p className="text-gray-700">
            We strongly recommend that you consult with a financial advisor
            before making any investments or trading decisions. Proceed with
            caution and ensure that you understand the risks involved.
          </p>
        </div>
      </div>
      {/* Show navbar if the user is logged in */}
      {isAuth && <NavigationBar />}
    </div>
  );
};

export default AboutPage;
