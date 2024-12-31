import React from "react";
import { InputFieldProps } from "../utils/type";

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  required,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm mb-2">{label}:</label>
      <input
        type={type}
        name={name}
        placeholder={label}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-3xl 
        bg-slate-300 text-textColor placeholder-gray-500 shadow-[#b9b9b9] shadow-md focus:outline-none focus:ring-2 focus:ring-bgColor"
      />
    </div>
  );
};

export default InputField;
