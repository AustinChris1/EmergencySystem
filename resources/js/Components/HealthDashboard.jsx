import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Search, MapPin, Calendar, Users, Flame, Thermometer, Droplets, Sun, Moon } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "./Loader";
import Sidebar from "./Sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Card Component
function Card({ children }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg transition-shadow hover:shadow-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
            {children}
        </div>
    );
}

// Widget Component
function Widget({ title, value, icon, color }) {
    return (
        <div className={`p-4 rounded-lg shadow-md flex items-center space-x-4 bg-<span class="math-inline">\{color\}\-50 dark\:bg\-</span>{color}-800 dark:text-gray-100`}>
            <div className={`p-3 rounded-full bg-<span class="math-inline">\{color\}\-100 dark\:bg\-</span>{color}-700`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
                <p className="text-2xl font-semibold">{value}</p>
            </div>
        </div>
    );
}

// Card Content Component
function CardContent({ children }) {
    return <div className="p-4 dark:text-gray-200">{children}</div>;
}

function ToggleButton({ status, onToggle }) {
    return (
        <>
            {status === "0" ? (
                <button
                    onClick={onToggle}
                    className="px-4 py-2 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                >
                    Mark as Resolved
                </button>
            ) : (
                <p className="text-green-600 font-semibold dark:text-green-400">Resolved</p>
            )}
        </>
    );
}

export default function HealthDashboard() {
    const [alerts, setAlerts] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const alertsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const fetchAlerts = async () => {
        try {
            const res = await axios.get("/api/all");
            if (res.status === 200) {
                const HealthAlerts = res.data.alerts.filter(
                    (alert) => alert.alertType.toLowerCase() === "medical"
                );
                setAlerts(HealthAlerts);
                setUsers(res.data.user);
                prepareChartData(HealthAlerts);
            } else {
                console.error(res.data.message);
            }
        } catch (error) {
            console.error("Failed to fetch alerts.");
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = (alerts) => {
        const dailyCounts = {};
        alerts.forEach(alert => {
            const date = new Date(alert.created_at).toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const sortedDates = Object.keys(dailyCounts).sort();
        const data = sortedDates.map(date => ({
            date: date,
            cases: dailyCounts[date]
        }));
        setChartData(data);
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

    // Filter Health cases by date
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
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
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
                    const HealthAlerts = response.data.alerts.filter(
                        (alert) => alert.alertType.toLowerCase() === "medical"
                    );

                    setSearchResults(HealthAlerts);
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
    const currentAlerts = (filteredAlerts.length > 0 ? filteredAlerts : alerts).slice(indexOfFirstAlert, indexOfLastAlert);
    const totalPages = Math.ceil((filteredAlerts.length > 0 ? filteredAlerts : alerts).length / alertsPerPage);

    useEffect(() => {
        let filtered = alerts;
        if (startDateFilter && endDateFilter) {
            filtered = alerts.filter(alert => {
                const alertDate = parseDate(alert.created_at);
                return alertDate >= startDateFilter && alertDate <= endDateFilter;
            });
        }
        setFilteredAlerts(filtered);
    }, [startDateFilter, endDateFilter, alerts]);

    return (
        <div className={`flex h-full w-full bg-gray-100 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300`}>
            {/* Sidebar */}
            <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Main Content */}
            <div className={`flex-1 pr-4 space-y-8 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300 ${isSidebarExpanded ? 'ml-48' : 'ml-16'}`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Emergency Response Medical Dashboard 🏥
                    </h1>
                </div>

                {/* Widgets Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Widget title="Cases Today" value={dailyCases.length} icon={<Calendar size={24} />} color="blue" />
                    <Widget title="Cases This Week" value={weeklyCases.length} icon={<Calendar size={24} />} color="green" />
                    <Widget title="Cases This Month" value={monthlyCases.length} icon={<Calendar size={24} />} color="purple" />
                    <Widget title="Total Users" value={users.length} icon={<Users size={24} />} color="indigo" />
                </div>

                {/* Chart Section */}
                <Card>
                    <CardContent>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Medical Alerts Over Time</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                                <XAxis dataKey="date" className="dark:text-gray-300" />
                                <YAxis className="dark:text-gray-300" />
                                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#374151' : '#fff', color: darkMode ? '#fff' : '#000' }} />
                                <Legend className="dark:text-gray-300" />
                                <Line type="monotone" dataKey="cases" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6 md:space-y-8">
                    {/* Date Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1">
                            <DatePicker
                                selected={startDateFilter}
                                onChange={setStartDateFilter}
                                selectsStart
                                startDate={startDateFilter}
                                endDate={endDateFilter}
                                placeholderText="Start Date"
                                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <div className="flex-1">
                            <DatePicker
                                selected={endDateFilter}
                                onChange={setEndDateFilter}
                                selectsEnd
                                startDate={startDateFilter}
                                endDate={endDateFilter}
                                minDate={startDateFilter}
                                placeholderText="End Date"
                                className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setStartDateFilter(null);
                                setEndDateFilter(null);
                            }}
                            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                        >
                            Clear Filters
                        </button>
                    </div>

                    {/* Search Section */}
                    <div className="rounded-md shadow-sm">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full border rounded-md py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-500 dark:text-gray-400" size={18} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Search and Incoming Cases Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        {/* Incoming Cases */}
                        <Card>
                            <CardContent>
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Incoming Cases</h2>
                                {loading ? (<Loader />
                                ) : searchResults.length > 0 ? (
                                    // Show search results if available
                                    <div className="space-y-3">
                                        {searchResults.map(alert => (
                                            <motion.div
                                                key={alert.id}
                                                onClick={() => setSelectedCase(alert)}
                                                className={`cursor-pointer p-4 border rounded-xl flex justify-between items-center bg-opacity-50 hover:bg-opacity-75 transition-colors dark:bg-opacity-80 dark:hover:bg-opacity-70 ${alert.status === "0" ? "bg-red-200 dark:bg-red-800" : "bg-green-200 dark:bg-green-800"}`}
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                            >
                                                <span className="font-semibold text-base">
                                                    {alert.content} - {formatDate(alert.created_at)}
                                                </span>
                                                {alert.status === "1" ? <Check className="text-green-700 dark:text-green-400" size={20} /> : <AlertTriangle className="text-red-700 dark:text-red-400" size={20} />}
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : filteredAlerts.length === 0 && alerts.length === 0 ? (
                                    <p className="text-gray-600 dark:text-gray-300">No active Health alerts.</p>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            {currentAlerts.map((alert) => {
                                                const alertColor = alert.status === "0" ? "red" : "green";

                                                return (
                                                    <motion.div
                                                        key={alert.id}
                                                        onClick={() => setSelectedCase(alert)}
                                                        className={`cursor-pointer p-4 border rounded-xl flex justify-between items-center bg-${alertColor}-50 hover:bg-${alertColor}-100 transition-colors dark:bg-${alertColor}-800 dark:border-${alertColor}-700 ${selectedCase && selectedCase.id === alert.id ? `border-2 border-${alertColor}-500` : ''}`}                                                    {...(alert.status === "0"
                                                            ? { animate: { opacity: [0.5, 1, 0.5] }, transition: { repeat: Infinity, duration: 1 } }
                                                            : {})}
                                                    >
                                                        <span className={`text-${alertColor}-700 font-semibold text-base dark:text-${alertColor}-400`}>
                                                            {alert.content} - {formatDate(alert.created_at)}
                                                        </span>
                                                        {alert.status === "1" ? (
                                                            <Check className="text-green-700 dark:text-green-400" size={20} />
                                                        ) : (
                                                            <AlertTriangle className="text-red-700 dark:text-red-400" size={20} />
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/*Pagination Controls */}
                                        <div className="flex justify-center mt-4">
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 mx-1 border rounded-md disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
                                            >
                                                Previous
                                            </button>
                                            <span className="mx-2 text-gray-700 dark:text-gray-300">{`Page ${currentPage} of ${totalPages}`}</span>
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 mx-1 border rounded-md disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Case Details & Map */}
                    {selectedCase && (
                        <Card>
                            <CardContent>
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Case Details</h2>
                                {(() => {
                                    const user = getUserDetails(selectedCase.UID);
                                    return (
                                        <>
                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="flex-shrink-0">
                                                    {user.image && (
                                                        <img
                                                            src={user.image}
                                                            alt={user.first_name}
                                                            className="w-14 h-14 rounded-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-gray-700 font-semibold dark:text-gray-300">
                                                        Reporter: {user.first_name} {user.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 mb-2 dark:text-gray-300">
                                                <strong>Device ID:</strong> {selectedCase.UID}
                                            </p>
                                            <p className="text-gray-700 mb-2 dark:text-gray-300">
                                                <strong>Location:</strong> {selectedCase.latitude}, {selectedCase.longitude}
                                            </p>
                                            <p className="text-gray-700 mb-2 dark:text-gray-300">
                                                <strong>Reported:</strong> {formatDate(selectedCase.created_at)}
                                            </p>
                                            <p className="text-gray-700 mb-3 dark:text-gray-300">
                                                <strong>Status:</strong>{" "}
                                                {selectedCase.status === "0" ? "Unresolved" : "Resolved"}
                                            </p>
                                            <div className="mb-4">
                                                <ToggleButton
                                                    status={selectedCase.status}
                                                    onToggle={() => changeStatus(selectedCase.id)}
                                                />
                                            </div>
                                            <div className="mt-4 w-full h-72 rounded-xl overflow-hidden">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    marginHeight="0"
                                                    marginWidth="0"
                                                    title="Google Maps Embed"
                                                    src={`https://maps.google.com/maps?q=${selectedCase.latitude},${selectedCase.longitude}&z=15&output=embed`}
                                                ></iframe>
                                            </div>
                                        </>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}