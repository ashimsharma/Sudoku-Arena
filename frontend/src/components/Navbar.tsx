import { FaCircleUser } from "react-icons/fa6";
import { FaUserFriends, FaBars, FaTimes } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [noOfFriendRequests, setNoOfFriendRequests] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/get-friend-requests`,
          { withCredentials: true }
        );
        if (response) {
          setNoOfFriendRequests(response.data.data.friendRequests.length);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  return (
    <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-md py-4 shadow-lg w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <motion.h1
          className="text-4xl font-bold tracking-wide text-red-500 cursor-pointer"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
        >
          SUDOKU <span className="text-white">ARENA</span>
        </motion.h1>

        {/* Desktop Links */}
        <div className="md:hidden flex space-x-6 text-lg items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors duration-300 hover:text-red-500 ${
                  isActive ? "text-red-500" : "text-gray-300"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Friend Requests */}
          <motion.div
            className="relative text-white hover:text-red-500 cursor-pointer"
            onClick={() =>
              navigate("/friend-requests", { state: { from: location.pathname } })
            }
            whileHover={{ scale: 1.1 }}
          >
            <FaUserFriends size={28} />
            {noOfFriendRequests > 0 && (
              <div className="absolute -top-1 -right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {noOfFriendRequests}
              </div>
            )}
          </motion.div>

          {/* Profile */}
          <motion.div
            className="text-white hover:text-red-500 cursor-pointer"
            onClick={() => navigate("/profile", { state: { from: location.pathname } })}
            whileHover={{ scale: 1.1 }}
          >
            <FaCircleUser size={28} />
          </motion.div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="hidden md:block text-white cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="hidden md:flex flex-col items-center bg-gray-900 pb-4 space-y-4"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `transition-colors duration-300 hover:text-red-500 ${
                  isActive ? "text-red-500" : "text-gray-300"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Friend Requests */}
          <div
            className="relative text-white hover:text-red-500 cursor-pointer"
            onClick={() => {
              navigate("/friend-requests", { state: { from: location.pathname } });
              setMenuOpen(false);
            }}
          >
            <FaUserFriends size={28} />
            {noOfFriendRequests > 0 && (
              <div className="absolute -top-1 -right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {noOfFriendRequests}
              </div>
            )}
          </div>

          {/* Profile */}
          <div
            className="text-white hover:text-red-500 cursor-pointer"
            onClick={() => {
              navigate("/profile", { state: { from: location.pathname } });
              setMenuOpen(false);
            }}
          >
            <FaCircleUser size={28} />
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
