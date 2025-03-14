import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 py-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-5xl font-bold tracking-wide text-red-500" style={ {fontFamily: "'Bebas Neue', sans-serif" }}>SUDOKU <span className="text-white">ARENA</span></h1>
        <div className="space-x-4 text-lg">
          <NavLink to="/" className={({isActive}) => `hover:text-red-500 ${isActive ? 'text-red-500' : 'text-gray-300'}`}>Home</NavLink>
          <NavLink to="/leaderboard" className={({isActive}) => `hover:text-red-500 ${isActive ? 'text-red-500' : 'text-gray-300'}`}>Leaderboard</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;