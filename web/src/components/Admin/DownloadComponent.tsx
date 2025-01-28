import { ToastContainer } from "react-toastify";
import { handleDownloadApi } from "../../services/adminAPI"; // Import the function

function DownloadComponent() {
  const handleDownload = (url: string) => {
    handleDownloadApi(url);
  };

  return (
    <div className="text-gray-600 pb-28 h-screen no-scrollbar overflow-y-scroll p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold mb-6">Download CSV Files</h1>
      <ul className="space-y-4 flex flex-wrap gap-2 items-center">
        <li>
          <button
            onClick={() => handleDownload("/download-users")}
            className="px-4 py-2 bg-bgColor text-white rounded hover:bg-blue-600"
          >
            Users
          </button>
        </li>
        <li>
          <button
            onClick={() => handleDownload("/download-deposits")}
            className="px-4 py-2 bg-bgColor text-white rounded hover:bg-green-600"
          >
            Deposits
          </button>
        </li>
        <li>
          <button
            onClick={() => handleDownload("/download-withdrawals")}
            className="px-4 py-2 bg-bgColor text-white rounded hover:bg-yellow-600"
          >
            Withdrawals
          </button>
        </li>
        <li>
          <button
            onClick={() => handleDownload("/download-utilitys")}
            className="px-4 py-2 bg-bgColor text-white rounded hover:bg-purple-600"
          >
            Utilities
          </button>
        </li>
      </ul>
    </div>
  );
}

export default DownloadComponent;
