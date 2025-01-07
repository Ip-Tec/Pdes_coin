import React, { useState } from "react";
import { InputFieldProps } from "../utils/type";
import { Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import React Icons

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  required,
  icon,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return type === "checkbox" ? (
    <div className="flex items-center mb-4">
      <input
        type="checkbox"
        name={name}
        checked={typeof value === "boolean" ? value : false}
        onChange={onChange}
        className="mr-2 w-6 h-6 border-2 border-gray-300 rounded-md appearance-none bg-slate-400 checked:bg-blue-500 checked:border-blue-500 checked:ring-2 checked:ring-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
      />
      <label className="text-gray-700">
        <Link to="/about" className="text-blue-500 hover:underline">
          {label}
        </Link>
      </label>
    </div>
  ) : (
    <div className="mb-4 relative w-full">
      <label className="block text-gray-700 text-sm mb-2">{label}:</label>
      {icon && <span className="absolute left-3 top-1/2 mt-3 transform -translate-y-1/2">{icon}</span>}
      <input
        type={type === "password" && !showPassword ? "password" : "text"} // Toggle input type based on visibility
        name={name}
        placeholder={label}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-[#D9D9D9] rounded-3xl 
        bg-slate-300 text-textColor placeholder-gray-500 shadow-[#b9b9b9] shadow-md focus:outline-none focus:ring-2 focus:ring-bgColor"
      />
      {type === "password" && (
        <span
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 mt-3 transform -translate-y-1/2 cursor-pointer"
        >
          {showPassword ? (
            <AiFillEyeInvisible size={24} className="text-bgColor" /> // Invisible eye icon
          ) : (
            <AiFillEye size={24} className="text-bgColor" /> // Visible eye icon
          )}
        </span>
      )}
    </div>
  );
};

export default InputField;
