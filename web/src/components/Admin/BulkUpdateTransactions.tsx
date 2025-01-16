import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BulkUpdateTransactions: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "/api/bulk-update-transactions",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Transactions updated successfully!");
    } catch (error) {
      toast.error("Error updating transactions.");
    }
  };

  return (
    <div className="mt-32 max-w-lg text-gray-500 mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Bulk Update Transactions</h2>
      <input
        type="file"
        onChange={handleFileUpload}
        className="p-3 border border-gray-300 rounded-lg w-full mb-4"
      />
      <button
        onClick={handleUpload}
        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Upload File and Update Transactions
      </button>
    </div>
  );
};

export default BulkUpdateTransactions;
