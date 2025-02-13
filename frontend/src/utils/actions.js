/* ====   USER ACTIONS   ==== */
const connectDB = "./config/db";
const revalidatePath = "./config/db";
//Add Updates To User Information
export const updateUser = async (prevState, formData) => {
	const {
		id,
		username,
		fullname,
		email,
		password,
		role,
		nationality,
		city,
		phone,
		sex,
		address,
		user_img,
		establishment_type,
		bank_name,
		account_number,
		account_name,
		working_area,
	} = Object.fromEntries(formData);

	try {
		connectDB();

		const updateFields = {
			id,
			username,
			fullname,
			email,
			password,
			role,
			nationality,
			city,
			phone,
			sex,
			address,
			user_img,
			establishment_type,
			bank_name,
			account_number,
			account_name,
			working_area,
		};

		Object.keys(updateFields).forEach(
			(key) => updateFields[key] === undefined && delete updateFields[key]
		);
		Object.keys(updateFields).forEach(
			(key) => updateFields[key] === "" && delete updateFields[key]
		);

		// console.log(updateFields);
		await User.findByIdAndUpdate(id, updateFields);
	} catch (error) {
		// console.log(error);
		if (error.message.includes("duplicate")) {
			return "Username or Email already Exists! Try another one.";
		}

		return "Failed to update User, please try again ";
	}
	revalidatePath("/dashboard/users");
	revalidatePath("/dashboard/user-settings");
	return "Updated Successfully";
};

export const updateProfileImage = async (userId, imageName, extension, imageFile) => {
    const uploadFolder = path.join(process.cwd(), "public", "upload_folder"); // Folder to save the images
    const newImageName = `${userId}-${imageName}`;
    const newImagePath = path.join(uploadFolder, newImageName);

    // Check if the image already exists
    if (fs.existsSync(newImagePath)) {
      // If the image exists, delete it first
      try {
        await unlinkAsync(newImagePath);
        // console.log("Old image deleted successfully.");
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    // Save the new image (this example assumes you convert the base64 to file)
    try {
      const base64Data = imageFile.split(",")[1]; // Strip out the base64 metadata
      const buffer = Buffer.from(base64Data, "base64");

      // Write the image file to disk
      fs.writeFileSync(newImagePath, buffer);
    //   console.log("New image saved successfully.");
    } catch (error) {
      console.error("Error saving new image:", error);
    }
  };