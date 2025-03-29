import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Search, MapPin, Calendar, Users, Flame, Thermometer, Droplets, Sun, Moon } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "./Loader";
import Sidebar from "./Sidebar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactApexChart from 'react-apexcharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Annotation,
    ZoomableGroup
} from "react-simple-maps";
import { geoEqualEarth } from "d3-geo";
import { feature } from "topojson-client";
import world from "./world-topo.json";

// Card Component
function Card({ children }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            {children}
        </div>
    );
}

// Widget Component

const generateRandomGraphData = (count = 7) => {
    const data = [];
    let lastValue = Math.floor(Math.random() * 100);
    for (let i = 0; i < count; i++) {
        const change = Math.floor(Math.random() * 20) - 10; // Random change between -10 and 9
        lastValue = Math.max(0, lastValue + change); // Ensure value doesn't go below 0
        data.push({ name: `Day ${i + 1}`, value: lastValue });
    }
    return data;
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? '∞%' : '0%';
    }
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
};

// Widget Component
function Widget({ title, value, icon, color, previousValue }) {
    const [graphData, setGraphData] = useState([]);
    const [percentageChange, setPercentageChange] = useState('');
    const [graphStrokeColor, setGraphStrokeColor] = useState('');
    const [iconColor, setIconColor] = useState('');

    useEffect(() => {
        setGraphData(generateRandomGraphData()); // Set random data on mount and update
        const graphColor = getColorForGraph(title);
        setGraphStrokeColor(graphColor);
        setIconColor(getIconColorForGraph(title));

        if (previousValue !== undefined) {
            setPercentageChange(calculatePercentageChange(value, previousValue));
        }
    }, [title, value, previousValue]);

    const getColorForGraph = (widgetTitle) => {
        switch (widgetTitle) {
            case "Cases Today":
                return "#6366F1"; // Indigo
            case "Cases This Week":
                return "#3B82F6"; // Blue
            case "Cases This Month":
                return "#EF4444"; // Red
            case "Total Users":
                return "#FACC15"; // Yellow
            default:
                return "#9CA3AF"; // Gray as a fallback
        }
    };

    const getIconColorForGraph = (widgetTitle) => {
        switch (widgetTitle) {
            case "Cases Today":
                return "#4F46E5"; // Darker Indigo
            case "Cases This Week":
                return "#2563EB"; // Darker Blue
            case "Cases This Month":
                return "#B91C1C"; // Darker Red
            case "Total Users":
                return "#D97706"; // Darker Yellow
            default:
                return "#6B7280"; // Darker Gray as a fallback
        }
    };

    return (
        <div className={`p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-lg flex flex-col`}>
            <div className="flex items-center space-x-4 mb-3">
                <div
                    className={`p-2 rounded-full dark-gray-800 flex text-gray-100 items-center justify-center`}
                    style={{ backgroundColor: getIconColorForGraph(title) }}
                >
                    {React.cloneElement(icon, { className: `text-${iconColor}` })}
                </div>                 <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
                {percentageChange && (
                    <p className="text-base text-gray-500 dark:text-gray-400">
                        <span className={percentageChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}>{percentageChange}</span>
                    </p>
                )}
            </div>
            <div className="mt-2 h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData}>
                        <Line type="monotone" dataKey="value" stroke={graphStrokeColor} strokeWidth={2} dot={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                    </LineChart>
                </ResponsiveContainer>
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
export default function FireDashboard() {
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
    const [mostAffectedAreas, setMostAffectedAreas] = useState([]);
    const [pastUsers, setPastUsers] = useState(0);



    const fetchAlerts = async () => {
        try {
            const res = await axios.get("/api/all");
            if (res.status === 200) {
                const fireAlerts = res.data.alerts.filter(
                    (alert) => alert.alertType.toLowerCase() === "fire"
                );
                setAlerts(fireAlerts);
                setUsers(res.data.user);
                prepareChartData(fireAlerts);
                prepareAffectedAreas(fireAlerts); // Prepare data for the map
                setPastUsers(Math.max(0, users.length - Math.floor(Math.random() * 20)));

            } else {
                console.error(res.data.message);
            }
        } catch (error) {
            console.error("Failed to fetch alerts.");
        } finally {
            setLoading(false);
        }
    };

    const prepareAffectedAreas = (alerts) => {
        const areas = {};
        alerts.forEach(alert => {
            const latitude = parseFloat(alert.latitude);
            const longitude = parseFloat(alert.longitude);
            if (!isNaN(latitude) && !isNaN(longitude)) {
                const key = `${latitude}-${longitude}`;
                areas[key] = (areas[key] || 0) + 1;
            } else {
                console.warn("Skipping alert with invalid latitude or longitude:", alert);
            }
        });


        const sortedAreas = Object.entries(areas)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
            .map(([coords, count]) => {
                const [latitudeStr, longitudeStr] = coords.split('-');
                const latitude = parseFloat(latitudeStr);
                const longitude = parseFloat(longitudeStr);
                return { latitude, longitude, count };
            });

        setMostAffectedAreas(sortedAreas);
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
        return () => clearInterval(interval);
    }, []);

    ///FOR WIDGETS


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

    // Calculate the start of the previous day, week, and month
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfMonth.getMonth() - 1);

    // Filter fire cases by date
    const dailyCases = alerts.filter(
        (alert) => parseDate(alert.created_at) >= startOfToday
    );
    const weeklyCases = alerts.filter(
        (alert) => parseDate(alert.created_at) >= startOfWeek
    );
    const monthlyCases = alerts.filter(
        (alert) => parseDate(alert.created_at) >= startOfMonth
    );

    // Filter fire cases for the previous day, week, and month for comparison
    const pastDailyCases = alerts.filter(
        (alert) =>
            parseDate(alert.created_at) >= startOfYesterday &&
            parseDate(alert.created_at) < startOfToday
    );
    const pastWeeklyCases = alerts.filter(
        (alert) =>
            parseDate(alert.created_at) >= startOfLastWeek &&
            parseDate(alert.created_at) < startOfWeek
    );
    const pastMonthlyCases = alerts.filter(
        (alert) =>
            parseDate(alert.created_at) >= startOfLastMonth &&
            parseDate(alert.created_at) < startOfMonth
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
                    const fireAlerts = response.data.alerts.filter(
                        (alert) => alert.alertType.toLowerCase() === "fire"
                    );

                    setSearchResults(fireAlerts);
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

    const prepareChartDataForApex = (data) => {
        const colors = ['#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#2b908f', '#f9a3a4', '#90ee7e', '#fa1a1a', '#f291e5']; // A palette of colors

        return {
            series: [{
                name: 'Fire Cases',
                data: data.map(item => {
                    const date = new Date(item.date);
                    return [date.getTime(), item.cases];
                }),
            }],
            options: {
                chart: {
                    type: 'area',
                    stacked: false,
                    zoom: {
                        enabled: true
                    },
                    toolbar: { // Add a toolbar for interactions (optional)
                        show: true,
                        export: {
                            csv: {
                                filename: 'fire_alerts_data',
                                columnDelimiter: ',',
                                headerCategory: 'Date',
                                headerValue: 'Cases',
                                dateFormatter(timestamp) {
                                    return new Date(timestamp).toLocaleDateString();
                                }
                            },
                            svg: {
                                filename: 'fire_alerts_chart',
                            },
                            png: {
                                filename: 'fire_alerts_chart',
                            }
                        }
                    },
                    animations: { // Add some subtle animation
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800,
                        animateGradually: {
                            enabled: true,
                            delay: 150
                        },
                        dynamicAnimation: {
                            enabled: true,
                            speed: 350
                        }
                    }
                },
                dataLabels: {
                    enabled: false
                },
                markers: {
                    size: 6,
                    colors: [colors[0]], // Use the primary color for markers
                    strokeColors: '#fff',
                    strokeWidth: 2,
                    hover: {
                        size: 8
                    }
                },
                fill: { // Add a gradient fill for visual appeal
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.9,
                        stops: [0, 100]
                    }
                },
                colors: [colors[0]], // Set the primary color for the area
                title: {
                    text: 'Fire Alerts Over Time',
                    align: 'left',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: darkMode ? '#fff' : '#333'
                    }
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        format: 'MMM dd, yyyy', // More informative date format
                        style: {
                            colors: darkMode ? '#ccc' : '#666'
                        }
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    title: {
                        text: 'Number of Cases',
                        style: {
                            color: darkMode ? '#ccc' : '#666'
                        }
                    },
                    min: 0,
                    labels: {
                        style: {
                            colors: darkMode ? '#ccc' : '#666'
                        }
                    },
                    grid: {
                        borderColor: darkMode ? '#444' : '#eee',
                        strokeDashArray: 5
                    }
                },
                grid: {
                    borderColor: darkMode ? '#444' : '#eee',
                    row: {
                        colors: darkMode ? ['#222', 'transparent'] : ['#f3f3f3', 'transparent'],
                    },
                },
                tooltip: {
                    shared: true,
                    style: {
                        backgroundColor: darkMode ? '#333' : '#fff',
                        color: darkMode ? '#fff' : '#333'
                    },
                    x: {
                        format: 'MMM dd, yyyy hh:mm:ss'
                    },
                    y: [{
                        title: 'Cases: ',
                        formatter: (val) => val
                    }]
                },
                legend: {
                    show: false // You can enable this if you have multiple series
                }
            },
        };
    };

    const [position, setPosition] = useState({ coordinates: [3, 6.5], zoom: 1 });
    const [clickedCoordinates, setClickedCoordinates] = useState(null);
    const [clickedLocationInfo, setClickedLocationInfo] = useState('');

    const handleZoomIn = useCallback(() => {
        setPosition(prev => ({
            ...prev,
            zoom: Math.min(prev.zoom * 1.2, 10), // Prevent excessive zooming
        }));
    }, []);

    const handleZoomOut = useCallback(() => {
        setPosition(prev => ({
            ...prev,
            zoom: Math.max(prev.zoom / 1.2, 1), // Prevent zooming out too far
        }));
    }, []);

    const handleMoveEnd = (newPosition) => {
        setPosition(newPosition); // Ensure state updates when user drags map
    };
    return (
        <div className={`flex h-full w-full bg-gray-300 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300`}>
            {/* Sidebar */}
            {/* <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} /> */}

            {/* Main Content */}
            <div className={`flex-1 p-6 space-y-8 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300`}>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-blue-900 dark:text-gray-100">
                        Emergency Response Fire Service 🔥
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Widget
                        title="Cases Today"
                        value={dailyCases.length}
                        icon={<Calendar size={20} />}
                        color="blue"
                        previousValue={pastDailyCases?.length}
                    />
                    <Widget
                        title="Cases This Week"
                        value={weeklyCases.length}
                        icon={<Calendar size={20} />}
                        color="green"
                        previousValue={pastWeeklyCases?.length}
                    />
                    <Widget
                        title="Cases This Month"
                        value={monthlyCases.length}
                        icon={<Calendar size={20} />}
                        color="purple"
                        previousValue={pastMonthlyCases?.length}
                    />
                    <Widget
                        title="Total Users"
                        value={users.length}
                        icon={<Users size={20} />}
                        color="indigo"
                    />
                </div>
                {/* Chart and Map Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart Section (using Nivo) */}
                    <Card>
                        <CardContent>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Fire Alerts Over Time</h2>
                            {chartData.length > 0 ? (
                                <ReactApexChart
                                    options={prepareChartDataForApex(chartData).options}
                                    series={prepareChartDataForApex(chartData).series}
                                    type="area"
                                    height={350}
                                />
                            ) : (
                                <p className="text-gray-600 dark:text-gray-300">No chart data available.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Most Affected Areas</h2>
                                <div className="space-x-2">
                                    <button onClick={handleZoomIn} className="...">+</button>
                                    <button onClick={handleZoomOut} className="...">-</button>
                                </div>
                            </div>
                            <div className="w-full h-auto rounded-xl overflow-hidden relative flex"> {/* Added flex */}
                                <div className="h-96 w-3/4 relative overflow-hidden"> {/* Map container with fixed height and width */}
                                    {mostAffectedAreas.length > 0 && mostAffectedAreas.some(area => !isNaN(area.latitude) && !isNaN(area.longitude)) ? (
                                        <ComposableMap
                                            projection={geoEqualEarth()}
                                            projectionConfig={{
                                                scale: 250, // Initial scale - zoom will multiply this
                                                center: position.coordinates,
                                            }}
                                            style={{ width: "100%", height: "100%", cursor: "grab" }} // Changed cursor for better UX
                                            onClick={(event) => {
                                                const [longitude, latitude] = [event.clientX, event.clientY];
                                                const projection = geoEqualEarth().scale(250 * position.zoom).center(position.coordinates);
                                                const [lon, lat] = projection.invert([longitude - event.target.getBoundingClientRect().left, latitude - event.target.getBoundingClientRect().top]);

                                                if (lon && lat) {
                                                    setClickedCoordinates({ latitude: lat, longitude: lon });
                                                    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=your_api`)
                                                        .then(response => response.json())
                                                        .then(data => {
                                                            if (data.results && data.results.length > 0) {
                                                                setClickedLocationInfo(data.results[0].formatted);
                                                            } else {
                                                                setClickedLocationInfo(`No location found at Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);
                                                            }
                                                        })
                                                        .catch(error => {
                                                            console.error('Error fetching location:', error);
                                                            setClickedLocationInfo('Error fetching location');
                                                        });
                                                } else {
                                                    setClickedCoordinates(null);
                                                    setClickedLocationInfo('');
                                                }
                                            }}
                                        >
                                            <ZoomableGroup
                                                center={position.coordinates}
                                                zoom={position.zoom}
                                                onMoveEnd={handleMoveEnd}
                                            >
                                                <Geographies geography={world}>
                                                    {({ geographies }) =>
                                                        geographies.map((geo) => (
                                                            <Geography
                                                                key={geo.rsmKey}
                                                                geography={geo}
                                                                fill="#a6cee3"
                                                                stroke="#1f78b4"
                                                                strokeWidth={0.5}
                                                                style={{ default: { outline: "none" }, hover: { outline: "none", fill: "#b2df8a" }, pressed: { outline: "none" } }}
                                                            />))
                                                    }
                                                </Geographies>
                                                {mostAffectedAreas.map((area, index) => (
                                                    <Marker
                                                        key={index}
                                                        coordinates={[area.longitude, area.latitude]}
                                                    >
                                                        <circle
                                                            r={area.count * 2 + 3}
                                                            fill={`rgba(255, 0, 0, ${Math.min(area.count / 5, 1) * 0.7 + 0.3})`}
                                                            stroke="#d62728"
                                                            strokeWidth={1}
                                                            style={{ opacity: 0.8, cursor: "pointer" }}
                                                        >
                                                            <title>{`Lat: ${area.latitude.toFixed(4)}, Lon: ${area.longitude.toFixed(4)} (${area.count} incidents)`}</title>
                                                        </circle>
                                                    </Marker>
                                                ))}
                                                {mostAffectedAreas.map((area, index) => (
                                                    <Annotation
                                                        key={`anno-${index}`}
                                                        subject={[area.longitude, area.latitude]}
                                                        dx={area.count > 2 ? -25 : 25}
                                                        dy={-15}
                                                        connectorProps={{ stroke: "#555", strokeWidth: 0.7, strokeDasharray: "3,3" }}
                                                    >
                                                        <text
                                                            x={4}
                                                            y={4}
                                                            alignmentBaseline="middle"
                                                            fontSize={11}
                                                            fill="#333"
                                                            fontWeight="bold"
                                                            style={{ textShadow: "1px 1px white" }}
                                                        >
                                                            {`${area.latitude.toFixed(2)}, ${area.longitude.toFixed(2)}`}
                                                        </text>
                                                    </Annotation>
                                                ))}
                                                {clickedCoordinates && (
                                                    <Marker coordinates={[clickedCoordinates.longitude, clickedCoordinates.latitude]}>
                                                        <circle r={5} fill="blue" stroke="#fff" strokeWidth={2} />
                                                    </Marker>
                                                )}
                                            </ZoomableGroup>
                                        </ComposableMap>) : (
                                        <p className="...">No significant affected areas to display.</p>
                                    )}
                                </div>
                                <div className="w-1/4 p-4 flex items-center"> {/* Text display area */}
                                    {clickedLocationInfo && <p className="text-sm text-gray-700 dark:text-gray-300">{clickedLocationInfo}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
                <div className="space-y-6 md:space-y-8 space-x-3 flex justify-center">
                    {/* Date Filter */}
                    <div className="flex flex-col sm:flex-row items-center justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex">
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
                        <div className="flex">
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
                                    </div>) : filteredAlerts.length === 0 && alerts.length === 0 ? (
                                        <p className="text-gray-600 dark:text-gray-300">No active fire alerts.</p>
                                    ) : (
                                    <>
                                        <div className="space-y-3">
                                            {currentAlerts.map((alert) => {
                                                const alertColor = alert.status === "0" ? "red" : "green";

                                                return (
                                                    <motion.div
                                                        key={alert.id}
                                                        onClick={() => setSelectedCase(alert)}
                                                        className={`cursor-pointer p-4 border rounded-xl flex justify-between items-center bg-${alertColor}-50 hover:bg-${alertColor}-100 transition-colors dark:bg-${alertColor}-800 dark:border-${alertColor}-700 ${selectedCase && selectedCase.id === alert.id ? `border-2 border-${alertColor}-500 dark:border-gray-200` : ''}`}                                                    {...(alert.status === "0"
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