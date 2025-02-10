import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import InputField from "../InputField";
import { DepositAccountProps } from "../../utils/type";
import { addAccount } from "../../services/adminAPI";
import { toast } from "react-toastify";

export default function AddDepositAccount() {
  const { user, isAuth } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountDetails, setAccountDetails] = useState<DepositAccountProps>({
    bank_name: "Opay",
    account_name: "",
    account_number: "",
    amount: 0,
    account_type: "",
    max_deposit_amount: 0, // Changed to number
  });

  // Check if the user is empty
  useEffect(() => {
    if (!user || !isAuth) {
      toast.error("You must be logged in to add a deposit account.");
      window.location.href = "/login";
    }
  }, [user, isAuth]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Perform validation
    const newErrors: Record<string, string> = {};
    if (!accountDetails.bank_name)
      newErrors.bank_name = "Bank name is required.";
    if (!accountDetails.account_name)
      newErrors.account_name = "Account name is required.";
    if (!accountDetails.account_number)
      newErrors.account_number = "Account number is required.";
    if (!accountDetails.account_type)
      newErrors.account_type = "Account type is required.";
    if (accountDetails.max_deposit_amount <= 0)
      newErrors.max_deposit_amount =
        "Maximum deposit amount must be greater than 0.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    const response = await addAccount({ ...accountDetails });
    if (response) {
      setAccountDetails({
        ...accountDetails,
        account_name: "",
        account_number: "",
        account_type: "",
        max_deposit_amount: 0,
      });
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountDetails({
      ...accountDetails,
      [name]: name === "max_deposit_amount" ? Number(value) : value, // Convert numeric fields
    });
    setErrors({
      ...errors,
      [name]: "", // Clear the error for the field being changed
    });
  };

  return (
    <div className="h-auto">
      <form className="flex flex-col space-y-4" onSubmit={handleFormSubmit}>
        <InputField
          label="Bank Name"
          type="text"
          name="bank_name"
          value={accountDetails.bank_name ?? "Opay"}
          onChange={handleChange}
          error={errors.bank_name}
        />
        <InputField
          label="Account Name"
          type="text"
          name="account_name"
          value={accountDetails.account_name}
          onChange={handleChange}
          error={errors.account_name}
        />
        <InputField
          label="Account Number"
          type="number"
          name="account_number"
          value={accountDetails.account_number}
          onChange={handleChange}
          error={errors.account_number}
        />
        <InputField
          label="Account Type"
          type="text"
          name="account_type"
          value={accountDetails.account_type}
          onChange={handleChange}
          error={errors.account_type}
        />
        <InputField
          label="Maximum Deposit Amount"
          type="text"
          name="max_deposit_amount"
          value={accountDetails.max_deposit_amount.toString()}
          onChange={handleChange}
          error={errors.max_deposit_amount}
        />
        <button
          type="submit"
          className="bg-bgColor w-3/4 align-middle m-auto mt-2 rounded-full text-white px-4 py-2"
        >
          Save
        </button>
      </form>
    </div>
  );
}
