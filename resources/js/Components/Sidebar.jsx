import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Heart, Shield, Info, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    // Load dark mode state from localStorage
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) {
            setDarkMode(storedTheme === "dark");
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const newMode = !prev;
            localStorage.setItem("theme", newMode ? "dark" : "light");
            return newMode;
        });
    };

    const toggleSidebar = () => setIsExpanded(!isExpanded);

    const navItems = [
        { path: "/", label: "Fire", icon: <Flame size={20} /> },
        { path: "/health", label: "Medical", icon: <Heart size={20} /> },
        { path: "/security", label: "Security", icon: <Shield size={20} /> },
        { path: "/general", label: "General", icon: <Info size={20} /> },
    ];

    return (
        <div className="relative z-50">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: "4rem" }}
                animate={{ width: isExpanded ? "10rem" : "4rem" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 bottom-0 h-full bg-gray-800 text-white z-40 dark:bg-gray-900 dark:text-gray-100 shadow-lg md:w-auto w-16"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -20 }}
                    transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0, ease: "easeInOut" }}
                    className="p-2 border-b border-gray-700 dark:border-gray-700 overflow-hidden"
                >
                    <h2 className="text-lg md:text-xl font-semibold whitespace-nowrap">Emergency Hub</h2>
                </motion.div>

                {/* Navigation */}
                <nav className="p-2">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-2 md:space-x-3 p-2 rounded-md transition-all duration-300 hover:bg-gray-700 dark:hover:bg-gray-700 ${
                                        location.pathname === item.path ? 'bg-gray-700 dark:bg-gray-700' : ''
                                    }`}
                                >
                                    <span className="text-sm md:text-base">{item.icon}</span>
                                    <motion.span
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -20 }}
                                        transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0, ease: "easeInOut" }}
                                        className="whitespace-nowrap overflow-hidden text-xs md:text-sm"
                                    >
                                        {item.label}
                                    </motion.span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Toggle Buttons */}
                <div className="absolute flex flex-col items-center gap-3 bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                        onClick={toggleSidebar}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full dark:bg-gray-700 dark:hover:bg-gray-600 shadow-md text-xs md:text-base"
                    >
                        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>

                    <button
                        onClick={toggleDarkMode}
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full dark:bg-gray-700 dark:hover:bg-gray-600 shadow-md text-xs md:text-base"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </motion.aside>

            {/* Page Content Padding */}
            <div className={`transition-all duration-300 ${isExpanded ? 'md:pl-64 pl-28' : 'pl-2'} dark:bg-gray-800 dark:text-gray-200 min-h-screen`}></div>
        </div>
    );
};

export default Sidebar;
