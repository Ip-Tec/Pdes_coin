import { useEffect, useState } from "react";
import { AccountAPI } from "../services/api";
import Loading from "../components/Loading";
import { toast } from "react-toastify";
import { AccountDetail } from "../utils/type";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function WalletPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState<AccountDetail>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setIsLoading(true);
        const response = await AccountAPI.getAccount();
        if (!response) {
          toast.error("Failed to fetch account details");
        } else {
          setAccountData(response);
        }
      } catch (error) {
        toast.error(`Error fetching account data: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, []);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const response = await AccountAPI.generateNewWallet();
      if (response) {
        setAccountData(response);
        toast.success("New wallet generated successfully!");
      } else {
        toast.error("Failed to generate wallet.");
      }
    } catch (error) {
      toast.error(`Error generating new wallet: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await AccountAPI.deleteWallet();
      if (response) {
        setAccountData(undefined);
        toast.success("Wallet deleted successfully!");
      } else {
        toast.error("Failed to delete wallet.");
      }
    } catch (error) {
      toast.error(`Error deleting wallet: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-mainBG">
        <Loading isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mainBG pb-16 mb-28">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
          {/* Back Button */}
          <button
            className="flex items-center text-primary mb-4 md:hidden"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="mr-2" />
            <span>Back</span>
          </button>

          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Wallet Details
          </h2>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-8 max-w-xl mx-auto bg-gray-100 p-4 rounded-lg shadow-md"
          >
            {isLoading ? (
              <Loading isLoading={isLoading} />
            ) : accountData ? (
              <>
                <h3 className="text-lg font-bold mb-2 text-gray-600">
                  Account Details
                </h3>
                <p className="text-gray-800">
                  <strong>PDES/BTC Address:</strong> {accountData.BTC}
                </p>
                <p className="text-gray-800">
                  <strong>PDES/ETH Address:</strong> {accountData.ETH}
                </p>
                <p className="text-gray-800">
                  <strong>PDES/BCH Address:</strong> {accountData.BTC}
                </p>
              </>
            ) : (
              <p className="text-gray-600">No account data available.</p>
            )}
          </motion.div>

          {/* Generate and Delete Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={handleGenerate}
            >
              Generate
            </button>
            <button
              className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletPage;
