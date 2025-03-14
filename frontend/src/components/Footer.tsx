import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gray-900 p-4 text-white text-center grid md:grid-cols-3 grid-cols-1">
            <div className="container mx-auto flex gap-4 basis-[fit-content] items-center justify-center md:justify-start">
                <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-700"
                >
                    <FaLinkedin size={24} />
                </a>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-700"
                >
                    <FaGithub size={24} />
                </a>
            </div>
            <p className="mt-2">&copy; 2025 Sudoku Arena. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
