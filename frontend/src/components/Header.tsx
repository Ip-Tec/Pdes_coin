import { Link } from "react-router-dom";
import logo from "../assets/pdes.png";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full text-white shadow z-50 bg-gradient-to-r from-bgColor to-secondary">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        <a href="/" className="flex items-center space-x-2">
          <img src={logo} alt="PDES Logo" className="h-8" />
          <span className="hidden md:block md:text-xl font-bold">PDES</span>
        </a>
        <ul className="flex space-x-6 text-white text-xl">
          <li>
            <a href="#about" className="hover:bg-bgColor md:p-2">
              About
            </a>
          </li>
          <li>
            <a href="#features" className="hover:bg-bgColor md:p-2">
              Features
            </a>
          </li>
          <li>
            <Link to={"/login"} className="hover:bg-bgColor md:p-2">
              Login
            </Link>
          </li>
          <li>
            <Link to={"/register"} className="hover:bg-bgColor md:p-2">
              Register
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
