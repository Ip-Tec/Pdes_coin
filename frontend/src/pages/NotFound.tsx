import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col text-gray-600 items-center justify-center h-screen text-center relative ">
      {/* Animated Lamp */}
      <motion.div
        className="absolute top-10 w-16 h-32 bg-yellow-300 rounded-b-full shadow-lg"
        initial={{ rotate: -15 }}
        animate={{
          rotate: [15, -15],
          transition: { duration: 2, repeat: Infinity, repeatType: "mirror" },
        }}
      >
        <div className="w-8 h-8  mx-auto mt-1 rounded-full"></div>
      </motion.div>

      {/* Light Beam */}
      <motion.div
        className="absolute top-20 w-40 h-80 bg-yellow-200 opacity-40 rounded-t-full"
        initial={{ rotate: -15 }}
        animate={{
          rotate: [15, -15],
          transition: { duration: 2, repeat: Infinity, repeatType: "mirror" },
        }}
      ></motion.div>

      <h1 className="text-9xl font-bold  z-10">404</h1>
      <h2 className="text-2xl font-bold  z-10">Page Not Found</h2>
      <p className="text-lg mt-2 text-gray-600 z-10">
        Oops! The page you're looking for doesn't exist.
      </p>
      <div className="flex flex-wrap justify-center items-center gap-2 z-10">
        <Link to="/" className="mt-4 px-6 py-2 bg-bgColor text-slate-100  rounded-lg">
          Go Home
        </Link>
        <Link to="/login" className="mt-4 px-6 py-2 bg-bgColor text-slate-100 rounded-lg">
          Login
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
