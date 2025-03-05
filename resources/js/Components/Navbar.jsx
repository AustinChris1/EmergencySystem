import React from 'react'
import { Link } from 'react-router-dom'
const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 rounded-md mb-6">
    <ul className="flex justify-center space-x-8">
        <li>
            <Link to="/" className="text-white hover:text-gray-300">Fire</Link>
        </li>
        <li>
            <Link to="/General" className="text-white hover:text-gray-300">Medical</Link>
        </li>
        <li>
            <Link to="/security" className="text-white hover:text-gray-300">Security</Link>
        </li>
        <li>
            <Link to="/general" className="text-white hover:text-gray-300">General</Link>
        </li>
    </ul>
</nav>
)
}

export default Navbar