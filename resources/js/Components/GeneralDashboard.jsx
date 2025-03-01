import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Loader from "./Loader";

// Card Component
function Card({ children }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md transition-shadow hover:shadow-lg">
            {children}
        </div>
    );
}

// Card Content Component
function CardContent({ children }) {
    return <div className="p-4">{children}</div>;
}

function ToggleButton({ status, onToggle }) {
    return (
        <>
            {status === "0" ? (
                <button
                    onClick={onToggle}
                    className="px-4 py-2 rounded-md text-white font-semibold bg-red-500"
                >
                    Mark as Resolved
                </button>
            ) : (
                <p className="text-green-500">Resolved</p>
            )}
        </>
    );
}

export default function GeneralDashboard() {
    const [alerts, setAlerts] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const alertsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get("/api/all");
            if (res.status === 200) {
                const GeneralAlerts = res.data.alerts.filter(
                    (alert) => alert.alertType.toLowerCase() === "general"
                );
                setAlerts(GeneralAlerts);
                setUsers(res.data.user);
            } else {
                console.error(res.data.message);
            }
        } catch (error) {
            console.error("Failed to fetch alerts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts(); // Initial Fetch

        const interval = setInterval(fetchAlerts, 5000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Helper function to parse date
    const parseDate = (dateString) => new Date(dateString);

    // Get current date, week start, and month start
    const today = new Date();
    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Set to last Sunday

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Filter General cases by date
    const dailyCases = alerts.filter(
        (alert) => parseDate(alert.created_at) >= startOfToday
    );
    const weeklyCases = alerts.filter(
        (alert) => parseDate(alert.created_at) >= startOfWeek
    );
    const monthlyCases = alerts.filter(
        (alert) => parseDate(alert.created_at) >= startOfMonth
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getUserDetails = (deviceId) => {
        const user = users.find((user) => user.device_uid === deviceId);
        return user || { first_name: "Unknown", last_name: "Unknown" };
    };

    const changeStatus = async (id) => {
        try {
            const res = await axios.post(`/api/status/${id}`);

            if (res.status === 200) {
                toast.success(res.data.message);
                fetchAlerts();
            } else {
                console.error(res.data.message || "Failed to update status.");
            }
        } catch (error) {
            console.error("An error occurred while updating status.");
        }
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim()) {
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/search`, {
                    params: { query: term },
                    headers: { 'Accept': 'application/json' },
                });

                if (response.data && response.data.status === 200 && Array.isArray(response.data.alerts)) {
                    const GeneralAlerts = response.data.alerts.filter(
                        (alert) => alert.alertType.toLowerCase() === "general"
                    );

                    setSearchResults(GeneralAlerts);
                } else {
                    setSearchResults([]); // Ensure empty array if no valid response
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]); // Ensure results are cleared on error
            } finally {
                setIsLoading(false);
            }
        } else {
            setSearchResults([]); // Clear results if input is empty
        }
    };

    // Pagination
    const indexOfLastAlert = currentPage * alertsPerPage;
    const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
    const currentAlerts = alerts.slice(indexOfFirstAlert, indexOfLastAlert);
    const totalPages = Math.ceil(alerts.length / alertsPerPage);

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Navbar */}
            <nav className="bg-gray-800 p-4 rounded-md mb-6">
                <ul className="flex justify-center space-x-8">
                    <li>
                        <Link to="/" className="text-white hover:text-gray-300">Fire</Link>
                    </li>
                    <li>
                        <Link to="/General" className="text-white hover:text-gray-300">Health</Link>
                    </li>
                    <li>
                        <Link to="/security" className="text-white hover:text-gray-300">Security</Link>
                    </li>
                    <li>
                        <Link to="/general" className="text-white hover:text-gray-300">General</Link>
                    </li>
                </ul>
            </nav>

            <h1 className="text-black text-3xl md:text-4xl font-bold text-center mb-6">
                General Dashboard
            </h1>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent>
                        <p className="text-2xl font-semibold">{dailyCases.length}</p>
                        <p className="text-gray-600">Cases Today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-2xl font-semibold">{weeklyCases.length}</p>
                        <p className="text-gray-600">Cases This Week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-2xl font-semibold">{monthlyCases.length}</p>
                        <p className="text-gray-600">Cases This Month</p>
                    </CardContent>
                </Card>
            </div>
            {/* Search Bar */}
            <div className="mb-4 flex items-center">
                <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="border rounded-md p-2 w-full"
                />
                <Search className="ml-2" />
            </div>
            {/* Incoming Cases */}
            <Card>
                <CardContent>
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">
                        Incoming Cases
                    </h2>
                    {loading ? (
                        <Loader />
                    ) : searchResults.length > 0 ? (
                        // Show search results if available
                        <div className="space-y-2">
                            {searchResults.map((alert) => {
                                const color = alert.status === "0" ? "red" : "green";

                                return (
                                    <motion.div
                                        key={alert.id}
                                        onClick={() => setSelectedCase(alert)}
                                        className={`cursor-pointer p-3 border rounded flex justify-between items-center bg-${color}-50 hover:bg-${color}-100 transition-colors`}
                                        {...(alert.status === "0"
                                            ? { animate: { opacity: [0.5, 1, 0.5] }, transition: { repeat: Infinity, duration: 1 } }
                                            : {})}
                                    >
                                        <span className={`text-${color}-700 font-semibold text-sm md:text-base`}>
                                            {alert.content} - {formatDate(alert.created_at)}
                                        </span>
                                        {alert.status === "1" ? (
                                            <Check className="text-green-700" size={20} />
                                        ) : (
                                            <AlertTriangle className="text-red-700" size={20} />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : alerts.length === 0 ? (
                        <p>No active General alerts.</p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {currentAlerts.map((alert) => {
                                    const color = alert.status === "0" ? "red" : "green";

                                    return (
                                        <motion.div
                                            key={alert.id}
                                            onClick={() => setSelectedCase(alert)}
                                            className={`cursor-pointer p-3 border rounded flex justify-between items-center bg-${color}-50 hover:bg-${color}-100 transition-colors`}
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            <span className={`text-${color}-700 font-semibold text-sm md:text-base`}>
                                                {alert.content} - {formatDate(alert.created_at)}
                                            </span>
                                            {alert.status === "1" ? (
                                                <Check className="text-green-700" size={20} />
                                            ) : (
                                                <AlertTriangle className="text-red-700" size={20} />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
            {/* Case Details & Map */}
            {selectedCase && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl md:text-2xl font-semibold">Case Details</h2>
                        {/* Display correct user information */}
                        {(() => {
                            const user = getUserDetails(selectedCase.UID);
                            return (
                                <>
                                    <div className="flex items-center space-x-4 mb-2">
                                        <div className="flex-shrink-0">
                                            {user.image && (
                                                <img
                                                    src={user.image}
                                                    alt={user.first_name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-semibold">
                                                Reporter: {user.first_name} {user.last_name}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">
                                        <strong>Device ID:</strong> {selectedCase.UID}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Location:</strong> {selectedCase.latitude}, {selectedCase.longitude}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Reported:</strong> {formatDate(selectedCase.created_at)}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>Status:</strong>{" "}
                                        {selectedCase.status === "0" ? "Unresolved" : "Resolved"}
                                    </p>
                                    <div className="mb-4">
                                        <ToggleButton
                                            status={selectedCase.status}
                                            onToggle={() => changeStatus(selectedCase.id)}
                                        />
                                    </div>
                                    <div className="mt-4 w-full h-64 rounded-lg overflow-hidden">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="no"
                                            marginHeight="0"
                                            marginWidth="0"
                                            title="Google Maps Embed"
                                            src={`https://maps.google.com/maps?q=$${selectedCase.latitude},${selectedCase.longitude}&z=15&output=embed`}
                                        ></iframe>
                                    </div>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}