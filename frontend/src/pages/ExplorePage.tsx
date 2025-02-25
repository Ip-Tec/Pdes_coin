import React, { useState, useRef } from "react";

const ExplorePage = () => {
  // Define your sections with an image, title, and content.
  const sections = [
    {
      id: "intro",
      title: "Introduction",
      image: "/blog/Introduction.jpeg",
      content: (
        <>
          <p className="mb-4 text-gray-600">
            Hello, I’m Nafisat Muhammad—an online investor passionate about
            teaching people how to make money using just their smartphones.
            Today, I’m excited to introduce you to the Pdes platform—an
            innovative investment tool designed to help you earn regardless of
            the amount you invest.
          </p>
        </>
      ),
    },
    {
      id: "deposit",
      title: "How to Deposit",
      image: "/blog/deposit.png",
      content: (
        <>
          <p className="mb-4 text-gray-600">
            Depositing funds into your PDES account is simple and secure. Follow
            these steps:
          </p>
          <ol className="list-decimal list-inside text-gray-600">
            <li>Log in to your account.</li>
            <li>Navigate to the deposit section.</li>
            <li>Choose your preferred payment method.</li>
            <li>Confirm the transaction details.</li>
          </ol>
        </>
      ),
    },
    {
      id: "crypto",
      title: "What is Crypto?",
      image: "/blog/What_is_Crypto.jpeg",
      content: (
        <>
          <p className="mb-4 text-gray-600">
            Cryptocurrency is a digital or virtual form of currency that uses
            cryptography for security. It operates independently of a central
            bank, offering fast transfers, lower fees, and global accessibility.
          </p>
        </>
      ),
    },
    {
      id: "why",
      title: "Why Pdes?",
      image: "/blog/why_pdes.jpeg",
      content: (
        <>
          <p className="mb-4 text-gray-600">
            Pdes is a fully registered investment platform that takes your
            security seriously. With a robust email verification process, every
            user is genuine and your funds remain safe and secure.
          </p>
        </>
      ),
    },
    {
      id: "investment",
      title: "Investment Rates",
      image: "/blog/Investment_Rates.jpeg",
      content: (
        <>
          <p className="mb-4 text-gray-600">
            Your earnings can grow significantly over time. Whether it’s 30, 60,
            or 90 days—the compounding effect can be substantial, even for
            deposits as modest as 10,000 or 50,000 NGN.
          </p>
          <p className="text-gray-600">
            Remember to keep only one account to ensure fairness and avoid
            restrictions.
          </p>
        </>
      ),
    },
    {
      id: "benefits",
      title: "Deposit Benefits",
      image: "/blog/Deposit_Benefits.jpeg",
      content: (
        <>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>
              <strong>Higher Rewards:</strong> A larger first deposit unlocks
              greater initial rewards.
            </li>
            <li>
              <strong>Enhanced Profits:</strong> More capital means higher
              profits early on, keeping you motivated.
            </li>
          </ul>
          <p className="text-gray-600">
            We encourage new members to deposit more to maximize rewards and
            boost overall team benefits.
          </p>
        </>
      ),
    },
    {
      id: "update",
      title: "Updates",
      image: "/blog/update.jpeg",
      content: (
        <>
          <p className="mb-4 text-gray-600">Dear PDES Community,</p>
          <p className="mb-4 text-gray-600">
            We appreciate your support and participation! To ensure long-term
            sustainability, we’re making adjustments to our reward system:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>
              <strong>41% Weekly Reward:</strong> Ends on March 2, 2025. New
              deposits will no longer qualify after this date.
            </li>
            <li>
              <strong>Referral Bonus Update:</strong> From March 3, 2025, the
              referral bonus moves from 20% to 5%.
            </li>
          </ul>
          <p className="mb-4 text-gray-600">
            These changes will ensure platform stability, introduce sustainable
            rewards, and allow us to continue providing valuable services.
          </p>
          <p className="text-gray-600">🚀 PEDEX Team</p>
        </>
      ),
    },
  ];

  const [selectedSection, setSelectedSection] = useState(sections[0].id);
  const currentSection = sections.find(
    (section) => section.id === selectedSection
  );

  // Create a ref for the content area
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Function to handle card clicks and scroll to the content area
  const handleCardClick = (id: React.SetStateAction<string>) => {
    setSelectedSection(id);
    // Scroll to the content area smoothly
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen mb-24 text-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Pdes Investment Platform</h1>
        <p className="text-xl">Grow Your Wealth on the Go</p>
      </header>

      {/* Grid of Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleCardClick(section.id)}
              className={`w-full text-left rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 focus:outline-none
                ${
                  selectedSection === section.id
                    ? "border-2 border-bgColor"
                    : "border"
                }`}
            >
              <img
                src={section.image}
                alt={section.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {section.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Section Content */}
      <div className="px-4" ref={contentRef}>
        <div className="bg-white shadow-lg rounded-xl p-6">
          {currentSection && currentSection.content}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center my-8">
        <a
          href="/register"
          className="inline-block bg-blue-600 text-white py-3 px-8 rounded-full hover:bg-blue-700 transition-all duration-300"
        >
          Join Pdes Now
        </a>
      </div>
    </div>
  );
};

export default ExplorePage;
