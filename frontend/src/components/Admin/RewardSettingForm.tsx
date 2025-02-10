import { useState } from "react";
import { toast } from "react-toastify";
import InputField from "../../components/InputField";
import { configureRewardSetting } from "../../services/adminAPI";
import { RewardSettingFormData } from "../../utils/type";

function RewardSettingForm() {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<RewardSettingFormData>({
    weekly_percentage: 20.0,
    start_date: today,
    end_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await configureRewardSetting(formData); // Send form data to the backend
      if (response.status === 200) {
        toast.success("Reward settings updated successfully!");
        setFormData({
          weekly_percentage: 20.0,
          start_date: "",
          end_date: "",
        });
      }
    } catch (error) {
      toast.error("Failed to update reward settings. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">
        Configure Reward Settings
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <InputField
            label="Weekly Percentage (%)"
            type="number"
            name="weekly_percentage"
            value={formData.weekly_percentage}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="mb-4">
          <div className="mb-4 relative w-full">
            <label className="block text-gray-700 text-sm mb-2">
              Start Date:
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-2 border border-[#D9D9D9] rounded-3xl 
            bg-slate-300 text-textColor placeholder-gray-600 shadow-[#b9b9b9] shadow-md focus:outline-none focus:ring-2 focus:ring-bgColor"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-4 relative w-full">
            <label className="block text-gray-700 text-sm mb-2">
              End Date (Optional){" "}
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full px-4 py-2 border border-[#D9D9D9] rounded-3xl 
              bg-slate-300 text-textColor placeholder-gray-600 shadow-[#b9b9b9] shadow-md focus:outline-none focus:ring-2 focus:ring-bgColor"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-dark hover:bg-bgColor text-white py-2 px-4 rounded-md transition duration-300"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}

export default RewardSettingForm;
