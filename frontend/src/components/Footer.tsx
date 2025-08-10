import { FaGithub, FaLinkedin } from "react-icons/fa";
import SudokuMasterIcon from "../assets/sudoku-master-assets/sudoku-master-icon.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center md:text-left">
        {/* Social Links */}
        <div className="flex justify-center md:justify-start gap-6">
          <a
            href="https://linkedin.com/in/ashim-sharma7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-red-600 transition-colors duration-300"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={28} />
          </a>
          <a
            href="https://github.com/ashimsharma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-red-600 transition-colors duration-300"
            aria-label="GitHub"
          >
            <FaGithub size={28} />
          </a>
          <a
            href="https://sudokumaster.ashimsharma.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-300"
            aria-label="Sudoku Master"
          >
            <img
              src={SudokuMasterIcon}
              alt="Sudoku Master Icon"
              className="w-10 h-10 object-contain"
            />
          </a>
        </div>

        {/* Spacer for center column on desktop */}
        <div className="hidden md:block"></div>

        {/* Copyright */}
        <p className="text-gray-400 text-sm md:text-right">
          &copy; 2025 <span className="text-red-500 font-semibold">Sudoku Arena</span>. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
