import { useState } from "react";
import logo from "../assets/pdes.png";

function Withdraw() {
  const userBalance = 5000; // Example user balance
  const withdrawalLimit = 100; // Example minimum withdrawal limit
  const [selectedOption, setSelectedOption] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Opay");
  const [amount, setAmount] = useState("");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleProceed = () => {
    const withdrawalAmount = parseFloat(amount);

    if (isNaN(withdrawalAmount)) {
      alert("Please enter a valid amount.");
      return;
    }

    if (withdrawalAmount < withdrawalLimit) {
      alert(`Minimum withdrawal amount is $${withdrawalLimit}.`);
      return;
    }

    if (withdrawalAmount > userBalance) {
      alert("You cannot withdraw more than your balance.");
      return;
    }

    if (selectedOption === "BTC") {
      alert(
        `BTC Address: ${btcAddress}\nAmount: $${withdrawalAmount.toFixed(2)}`
      );
    } else if (selectedOption === "Naira") {
      alert(
        `${accountType} Account Number: ${accountNumber}\nAmount: $${withdrawalAmount.toFixed(
          2
        )}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-mainBG flex items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="absolute top-1 lg:top-4 left-4 z-10">
        <img src={logo} alt="Logo" className="h-34" />
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md z-20">
        <h1 className="text-2xl font-bold mb-4 text-center">Withdraw Funds</h1>
        <p className="text-center text-gray-600 mb-4">
          Balance:{" "}
          <span className="text-secondary font-bold">
            ${userBalance.toFixed(2)}
          </span>
        </p>

        {/* Selection Buttons */}
        <div className="flex justify-around mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedOption === "BTC"
                ? "bg-secondary text-white"
                : "bg-bgColor hover:bg-secondary"
            }`}
            onClick={() => setSelectedOption("BTC")}
          >
            Withdraw BTC
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedOption === "Naira"
                ? "bg-secondary text-white"
                : "bg-bgColor hover:bg-secondary"
            }`}
            onClick={() => setSelectedOption("Naira")}
          >
            Withdraw Naira
          </button>
        </div>

        {/* Common Amount Input */}
        {selectedOption && (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Enter Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder={`Minimum: $${withdrawalLimit}`}
              className="w-full bg-gray-100 text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
            />
          </div>
        )}

        {/* Form for BTC */}
        {selectedOption === "BTC" && (
          <div>
            <label
              htmlFor="btcAddress"
              className="block text-sm font-medium mt-4 mb-2"
            >
              Enter BTC Address
            </label>
            <input
              type="text"
              id="btcAddress"
              value={btcAddress}
              onChange={(e) => setBtcAddress(e.target.value)}
              placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              className="w-full bg-gray-100 text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
            />
          </div>
        )}

        {/* Form for Naira */}
        {selectedOption === "Naira" && (
          <div>
            <label
              htmlFor="accountType"
              className="block text-sm font-medium mt-4 mb-2"
            >
              Select Account Type
            </label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
            >
              <option value="Opay">Opay</option>
              <option value="Palmpay">Palmpay</option>
            </select>
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium mt-4 mb-2"
            >
              Enter {accountType} Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g., 1234567890"
              className="w-full bg-gray-100 text-black px-4 py-2 border rounded-lg focus:ring-2 focus:ring-bgColor focus:outline-none"
            />
          </div>
        )}

        {/* Proceed Button */}
        {selectedOption && (
          <button
            className="w-full mt-6 bg-bgColor text-white py-2 rounded-lg hover:bg-secondary"
            onClick={handleProceed}
          >
            Proceed
          </button>
        )}

        {/* Default Message */}
        {!selectedOption && (
          <p className="text-center text-gray-600 mt-4">
            Please select an option to proceed.
          </p>
        )}
      </div>
    </div>
  );
}

export default Withdraw;
