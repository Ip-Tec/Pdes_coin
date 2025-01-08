import { useEffect, useState } from "react";
import { AccountAPI } from "../services/api";
import Loading from "../components/Loading";
import { toast } from "react-toastify";

function WalletPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState(null);

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
        toast.error(`Error fetching account data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountDetails();
  }, []);

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
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            Wallet Details
          </h2>
          {accountData ? (
            <div className="space-y-4">
              <p>
                <strong>PDES/BTC Address:</strong> {accountData.BTC}
              </p>
              <p>
                <strong>PDES/ETH Address:</strong> {accountData.ETH}
              </p>
              <p>
                <strong>PDES/BCH Address:</strong> {accountData.BCH}
              </p>
            </div>
          ) : (
            <p className="text-gray-600">No wallet data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletPage;
