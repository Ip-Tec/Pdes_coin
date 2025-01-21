import { useState } from "react";
import InputField from "../../components/InputField";
import { addUtility } from "../../services/adminAPI";
import { ToastContainer, toast } from "react-toastify";
import AdminWrapper from "../../components/Admin/AdminWrapper";
import SlideInPanel from "../../components/Admin/SlideInPanel";
import RewardSettingForm from "../../components/Admin/RewardSettingForm";
import { useAuth } from "../../contexts/AuthContext";

function Utility() {
  const { user } = useAuth();
  const [activeComponent, setActiveComponent] = useState<string | null>(
    "UtilityData"
  );
  const [formData, setFormData] = useState({
    pdes_price: "",
    pdes_circulating_supply: "",
    conversion_rate: "",
    reward_percentage: "",
    referral_percentage: "",
    pdes_supply_left: "",
    pdes_total_supply: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await addUtility(formData);
      if (response.status === 200) {
        toast.success("Utility data added successfully!");
        setFormData({
          pdes_price: "",
          pdes_circulating_supply: "",
          conversion_rate: "",
          reward_percentage: "",
          referral_percentage: "",
          pdes_supply_left: "",
          pdes_total_supply: "",
        });
      }
    } catch (error) {
      toast.error("Error adding utility data. Please try again.");
      console.error(error);
    }
  };

  const navigationItems = [
    { label: "Utility Data", component: "UtilityData" },
    { label: "Configure Reward", component: "RewardForm" },
    { label: "Update CSV", component: "UpdateCSV" },
    {
      label: "Download Utility",
      component: "DownloadComponent",
      button: "trun",
    },
  ];

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "RewardForm":
        return (
          <SlideInPanel
            title="Reward Form"
            onClose={() => setActiveComponent(null)}
          >
            {user?.role === "developer" || user?.role === "super_admin" ? (
              <RewardSettingForm />
            ) : (
              <p>You do not have permission to access this form.</p>
            )}
          </SlideInPanel>
        );

      case "UtilityData":
        return (
          <>
            <h2 className="text-2xl font-bold text-center mb-8">
              Add Utility Data
            </h2>
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full md:max-w-lg mx-auto"
            >
              <InputField
                label="PDES Price"
                type="number"
                name="pdes_price"
                value={formData.pdes_price}
                onChange={handleChange}
              />

              <InputField
                label="PDES Circulating Supply"
                type="number"
                name="pdes_circulating_supply"
                value={formData.pdes_circulating_supply}
                onChange={handleChange}
              />

              <InputField
                label="Conversion Rate % to Naira"
                type="number"
                name="conversion_rate"
                value={formData.conversion_rate}
                onChange={handleChange}
              />

              <InputField
                label="Reward Percentage"
                type="number"
                name="reward_percentage"
                value={formData.reward_percentage}
                onChange={handleChange}
              />

              <InputField
                label="Referral Percentage"
                type="number"
                name="referral_percentage"
                value={formData.referral_percentage}
                onChange={handleChange}
              />

              <InputField
                label="PDES Supply Left"
                type="number"
                name="pdes_supply_left"
                value={formData.pdes_supply_left}
                onChange={handleChange}
              />

              <InputField
                label="PDES Total Supply"
                type="number"
                name="pdes_total_supply"
                value={formData.pdes_total_supply}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="bg-bgColor hover:bg-secondary text-white font-bold py-2 px-4 rounded-full w-full mt-4"
              >
                Submit
              </button>
            </form>
          </>
        );

      default:
        return null;
    }
  };
  return (
    <AdminWrapper>
      <ToastContainer />
      <div className="my-16 max-w-4xl text-gray-600 mx-auto px-6">
        <ul className="flex justify-around mb-6">
          {navigationItems.map((item) => (
            <li
              key={item.label}
              className="bg-bgColor text-sm py-2 px-4 text-center cursor-pointer transition duration-300 
              hover:bg-secondary text-white rounded-full border"
              onClick={() => setActiveComponent(item.component)}
            >
              {item.label}
            </li>
          ))}
        </ul>

        {/* Render Active Component */}
        {renderActiveComponent()}
      </div>
    </AdminWrapper>
  );
}

export default Utility;
