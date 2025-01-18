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

      if (response.status === 200 || response.status === 201) {
        toast.success("Transactions updated successfully!");
      } else {
        toast.error("Error updating transactions.");
      }

      toast.success("Transactions updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong. Try again.");
      } else {
        toast.error((error as Error).toString());
      }
    }
  };

  return (
    <div className="text-gray-600 mx-auto my-2 p-2">
      <h2 className="text-2xl font-semibold mb-4">Bulk Update Transactions</h2>
      <input
        type="file"
        onChange={handleFileUpload}
        className="p-3 border border-gray-300 rounded-lg w-full mb-4"
      />
      <button
        onClick={handleUpload}
        className="w-full p-3 bg-bgColor text-white rounded-lg hover:bg-secondary transition duration-300"
      >
        Upload File and Update Transactions
      </button>
    </div>
  );
};

export default BulkUpdateTransactions;
