import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navigation from "../components/NavigationBar";
import { FaSearch, FaArrowRight, FaArrowLeft } from "react-icons/fa";

function HelpCenterPage() {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const faqs = [
    {
      question: "What is PDES Coin?",
      answer:
        "PDES Coin is a decentralized cryptocurrency designed to offer seamless and secure transactions across platforms.",
    },
    {
      question: "How can I buy PDES Coin?",
      answer:
        "You can buy PDES Coin on supported exchanges. Check the 'How to Buy' section in the Support Center for step-by-step instructions.",
    },
    {
      question: "Is my wallet secure?",
      answer:
        "We recommend using a hardware wallet or our PDES Wallet for maximum security. Avoid sharing your seed phrase or private key.",
    },
  ];

  const guides = [
    {
      title: "How to set up your wallet",
      link: "/support",
      // link: "/guides/setup-wallet",
    },
    {
      title: "Understanding cryptocurrency basics",
      link: "/support",
      // link: "/guides/crypto-basics",
    },
    {
      title: "Troubleshooting transaction issues",
      link: "/support",
      // link: "/guides/transaction-issues",
    },
  ];

  return (
    <div className="min-h-screen bg-mainBG py-8 px-4">
      <button
        className="flex items-center text-primary mb-4 md:hidden"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="mr-2" />
        <span>Back</span>
      </button>
      <div className="container mx-auto max-w-5xl bg-white shadow-lg rounded-lg p-6 mb-24">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-primary mb-4">
          Help Center
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Find answers to your questions, guides, and more.
        </p>

        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search for help articles, FAQs..."
            className="w-full px-4 py-2 border border-[#D9D9D9] rounded-3xl bg-slate-300 text-textColor placeholder-gray-500 shadow-[#b9b9b9] shadow-md focus:outline-none focus:ring-2 focus:ring-bgColor"
          />
          <FaSearch className="absolute top-3 right-4 text-gray-500" />
        </div>

        {/* FAQs Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg text-primary mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guides Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Guides</h2>
          <div className="space-y-4">
            {guides.map((guide, index) => (
              <Link
                key={index}
                to={guide.link}
                className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md hover:bg-gray-200"
              >
                <h3 className="font-semibold text-lg text-primary">
                  {guide.title}
                </h3>
                <FaArrowRight className="text-primary" />
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <Link
            to="/support"
            className="px-6 py-3 bg-primary text-white rounded-md shadow-md hover:bg-primary-dark"
          >
            Contact Support
          </Link>
        </div>
      </div>
      {isAuth && <Navigation />}
    </div>
  );
}

export default HelpCenterPage;
