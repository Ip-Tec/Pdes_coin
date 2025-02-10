import React, { useState } from "react";
import { useFormAction } from "react-router-dom";
import { updateUser, updateProfileImage } from "../utils/actions";

const ProfileForm = () => {
  const user = {
    _id: "1234567890",
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    profilePic: "https://via.placeholder.com/100", // A placeholder image
    sex: "Male",
    username: "johndoe",
    phone: "+1234567890",
    address: "123 Main Street, Springfield",
  };

  const [state, formAction] = useFormAction(updateUser, undefined);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validation: Check file type
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a JPEG, PNG, or GIF image.");
        return;
      }

      // Validation: Check file size (e.g., max 2MB)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        alert("File size exceeds 5MB. Please upload a smaller image.");
        return;
      }
      // If validation passes, read the image file
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        // Get the image name
        const fileName = file.name;
        const extension = fileName.split('.').pop();


        // save the selected image to upload_folder in the backend
        // You can use the selectedImage state to store the image data
        console.log("user._id:",user._id,{fileName, extension, selectedImage})
        updateProfileImage(user._id, fileName, extension, selectedImage)
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Profile Update */}
      <form
        className="flex flex-col justify-between gap-3 w-full p-5 
         rounded-lg mb-56"
        action={formAction}
      >
        <input type="text" name="id" value={user._id} hidden readOnly />
        <h2 className="text-xl font-bold py-2 mb-2">Profile Update</h2>
        <div className="flex gap-1 mb-4 p-4">
          <img
            src={selectedImage || user.profilePic || "oldman"} // Show user's profilePic
            alt="Profile Avatar"
            width={100}
            height={100}
            className="w-[95px] h-[95px] rounded-lg"
          />

          <div>
            <p className="font-semibold text-lg">
              {user.firstname || "..."} {user.lastname || "..."}
            </p>
            <p className="text-sm py-1">{user.email || "..."}</p>
            <button
              type="button"
              className="text-[--blue]"
              onClick={() => document.getElementById("fileInput").click()} // Trigger file input click
            >
              Change profile image
            </button>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }} // Hide the file input
            />
          </div>
        </div>

        {/* Profile Update Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
          {/* Full Name */}
          <div className="gap-2 flex flex-col w-full">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="fullname"
            >
              Full Name
            </label>
            <input
              name="fullname"
              placeholder={`${user.firstname} ${user.lastname}`}
              className="w-full p-2 border bg-gray-100 border-gray-300 rounded-md"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-sm font-medium text-gray-700" htmlFor="sex">
              Sex
            </label>
            <input
              name="sex"
              placeholder={user.sex}
              className="w-full p-2 border bg-gray-100 border-gray-300 rounded-md"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="username"
            >
              Username
            </label>
            <input
              name="username"
              placeholder={user.username}
              className="w-full p-2 border bg-gray-100 border-gray-300 rounded-md"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              name="phone"
              placeholder={user.phone}
              className="w-full p-2 border bg-gray-100 border-gray-300 rounded-md"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              name="email"
              placeholder={user.email}
              className="w-full p-2 border bg-gray-100 border-gray-300 rounded-md"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="address"
            >
              Address
            </label>
            <input
              name="address"
              placeholder={user.address}
              className="w-full p-2 border bg-gray-100 border-gray-300 rounded-md"
            />
          </div>
        </div>
        <p className="pb-3 text-[--green] text-center text-base">
          {state && state}
        </p>
        <button type="submit" className="w-full primarybtn mt-3">
          Update Profile
        </button>
      </form>
    </>
  );
};

export default ProfileForm;
