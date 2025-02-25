

const ExplorePage = () => {
  return (
    <div className="min-h-screen mb-24 bg-transparent text-gray-800">
      {/* Header */}
      <header className="bg-bgColor text-white py-8 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Pdes Investment Platform</h1>
        <p className="text-xl">
          Learn How to Grow Your Wealth Using Your Smartphone
        </p>
      </header>

      {/* Navigation */}
      <nav className="bg-primary-dark py-4 text-center">
        <a href="#intro" className="text-white mx-4 hover:text-gray-200">
          Introduction
        </a>
        <a href="#why" className="text-white mx-4 hover:text-gray-200">
          Why Pdes?
        </a>
        <a href="#investment" className="text-white mx-4 hover:text-gray-200">
          Investment Rates
        </a>
        <a href="#benefits" className="text-white mx-4 hover:text-gray-200">
          Deposit Benefits
        </a>
        <a href="#update" className="text-white mx-4 hover:text-gray-200">
          Updates
        </a>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction Section */}
        <section id="intro" className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-bgColor pb-2 mb-4">
            Introduction
          </h2>
          <p className="mb-4">
            Hello, I’m Nafisat Muhammad—an online investor passionate about
            teaching people how to make money using just their smartphones.
            Today, I’m excited to introduce you to the Pdes platform, an
            innovative investment tool designed to help you earn regardless of
            the amount you invest.
          </p>
        </section>

        {/* Why Choose Pdes Section */}
        <section id="why" className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-bgColor pb-2 mb-4">
            Why Choose Pdes?
          </h2>
          <p className="mb-4">
            Pdes is a fully registered investment platform that takes your
            security seriously. With a robust email verification process, it
            ensures that every user is genuine and that your funds are safe and
            secure. This verification not only protects your investment but also
            underscores the platform's trustworthiness.
          </p>
        </section>

        {/* Dynamic Investment Rates Section */}
        <section id="investment" className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-bgColor pb-2 mb-4">
            Dynamic Investment Rates
          </h2>
          <p className="mb-4">
            One of the most impressive aspects of Pdes is how your earnings can
            grow over time. Even if two investors start at the same time, the
            differences in their earnings over 30, 60, or 90 days can be
            significant. Early investors, even with deposits as modest as 10,000
            or 50,000 NGN, can see substantial returns as their earnings
            compound.
          </p>
          <p>
            It’s important to maintain only one account per user—this helps
            ensure fairness and prevents any restrictions that might arise from
            multiple accounts.
          </p>
        </section>

        {/* Benefits of a Large First Deposit Section */}
        <section id="benefits" className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-bgColor pb-2 mb-4">
            Benefits of a Large First Deposit
          </h2>
          <ul className="list-disc list-inside mb-4">
            <li className="mb-2">
              <strong>Higher Rewards:</strong> A larger first deposit unlocks
              greater initial rewards.
            </li>
            <li className="mb-2">
              <strong>Enhanced Profits:</strong> More capital means higher
              profits early on, keeping you motivated and allowing you to
              experience the full benefits of the platform.
            </li>
          </ul>
          <p>
            When inviting new members to join Pdes, I encourage them to deposit
            a higher amount to maximize both their rewards and your overall team
            benefits.
          </p>
        </section>

        {/* Important Update Section */}
        <section id="update" className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-bgColor pb-2 mb-4">
            Important Update: Changes to Our Reward System!
          </h2>
          <p className="mb-4">Dear PDES Community,</p>
          <p className="mb-4">
            We appreciate your support and participation in our platform! To
            ensure long-term sustainability and growth, we’re making important
            adjustments to our reward structure:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li className="mb-2">
              <strong>41% Weekly Reward Closing Soon!</strong> The 41% weekly
              reward program will officially end on March 2, 2025. After this
              date, new deposits will no longer qualify for this reward.
            </li>
            <li className="mb-2">
              <strong>Referral Bonus Update:</strong> Starting March 3, 2025,
              the referral bonus will move from 20% to 5%. This adjustment
              allows us to build a more sustainable reward system while still
              appreciating our active users.
            </li>
          </ul>
          <p className="mb-4">
            <strong>Why are we making these changes?</strong>
          </p>
          <ul className="list-disc list-inside mb-4">
            <li className="mb-2">
              To ensure long-term stability of the platform.
            </li>
            <li className="mb-2">
              To introduce new, sustainable rewards tied to platform usage.
            </li>
            <li className="mb-2">
              To continue providing valuable services while growing our
              ecosystem.
            </li>
          </ul>
          <p className="mb-4">
            Stay tuned for more updates as we transition to a more robust and
            lasting reward model! Thank you for being part of our journey.
          </p>
          <p>🚀 PEDEX Team</p>
        </section>

        {/* Call to Action */}
        <section className="text-center my-12">
          <a
            href="/register"
            className="bg-bgColor text-white py-3 px-8 rounded hover:bg-secondary transition-colors"
          >
            Join Pdes Now
          </a>
        </section>
      </main>
    </div>
  );
};

export default ExplorePage;
