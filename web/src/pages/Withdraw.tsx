import { useState } from "react";

function Withdraw() {
  const [selectedOption, setSelectedOption] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Opay");

  return (
    <div className="min-h-screen bg-mainBG flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Withdraw Funds</h1>

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

        {/* Form for BTC */}
        {selectedOption === "BTC" && (
          <div>
            <label
              htmlFor="btcAddress"
              className="block text-sm font-medium mb-2"
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
            <button
              className="w-full mt-4 bg-bgColor text-white py-2 rounded-lg hover:bg-secondary"
              onClick={() => alert(`BTC Address: ${btcAddress}`)}
            >
              Proceed
            </button>
          </div>
        )}

        {/* Form for Naira */}
        {selectedOption === "Naira" && (
          <div>
            <label
              htmlFor="accountType"
              className="block text-sm font-medium mb-2"
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
            <button
              className="w-full mt-4 bg-bgColor text-white py-2 rounded-lg hover:bg-secondary"
              onClick={() =>
                alert(`${accountType} Account Number: ${accountNumber}`)
              }
            >
              Proceed
            </button>
          </div>
        )}

        {/* Default Message */}
        {!selectedOption ||
          (selectedOption && (
            <p className="text-center text-gray-600 mt-4">
              Please select an option to proceed.
              <span className="text-secondary block">
                make sure your account and details are correct
              </span>
            </p>
          ))}
      </div>
    </div>
  );
}

export default Withdraw;
