import { useState } from "react";
import InputField from "../../components/InputField";
import { addUtility } from "../../services/adminAPI";
import { ToastContainer, toast } from "react-toastify";
import AdminWrapper from "../../components/Admin/AdminWrapper";

function Utility() {
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

  return (
    <AdminWrapper>
      <ToastContainer />
      <div className="my-16 max-w-4xl text-gray-600 mx-auto px-6">
        <h2 className="text-xl font-bold mb-4">Add Utility Data</h2>
        <form onSubmit={handleSubmit} className="w-full md:max-w-sm m-auto">
          <div className="mb-4">
            <InputField
              label="PDES Price"
              type="number"
              name="pdes_price"
              value={formData.pdes_price}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <InputField
              label="PDES Circulating Supply"
              type="number"
              name="pdes_circulating_supply"
              value={formData.pdes_circulating_supply}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <InputField
              label="Conversion Rate % to Naira"
              type="number"
              name="conversion_rate"
              value={formData.conversion_rate}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <InputField
              label="Reward Percentage"
              type="number"
              name="reward_percentage"
              value={formData.reward_percentage}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <InputField
              label="Referral Percentage"
              type="number"
              name="referral_percentage"
              value={formData.referral_percentage}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <InputField
              label="PDES Supply Left"
              type="number"
              name="pdes_supply_left"
              value={formData.pdes_supply_left}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <InputField
              label="PDES Total Supply"
              type="number"
              name="pdes_total_supply"
              value={formData.pdes_total_supply}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="bg-bgColor align-middle flex w-3/4 justify-center items-center m-auto rounded-full text-white py-2 px-4"
          >
            Submit
          </button>
        </form>
      </div>
    </AdminWrapper>
  );
}

export default Utility;
