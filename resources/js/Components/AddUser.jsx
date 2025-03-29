import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddUser = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        middle_name: "",
        phone: "",
        email: "",
        date_of_birth: "",
        device_uid: "",
        current_location: "",
        status: false,
        image: null,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                image: file, // Ensure it's stored as a File object
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const form = new FormData();

        // Convert status from true/false to 1/0
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "status") {
                form.append(key, value ? 1 : 0);
            } else if (key === "image") {
                if (value) {
                    form.append(key, value); // Ensure file is correctly added
                }
            } else {
                form.append(key, value);
            }
        });

        // Debugging: Log FormData contents
        for (let pair of form.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }

        try {
            const response = await axios.post("/api/add", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(response.data.message);

            // Reset form
            setFormData({
                first_name: "",
                last_name: "",
                middle_name: "",
                phone: "",
                email: "",
                date_of_birth: "",
                device_uid: "",
                current_location: "",
                status: false,
                image: null,
            });
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
                toast.error("Failed to add user.");
            } else {
                toast.error("Failed to add user. Please try again.");
                console.error("Error adding user:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md shadow-md p-4">
            <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md dark:shadow-gray-700">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-100">Add User</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-4">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 ${errors.first_name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name[0]}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 ${errors.last_name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name[0]}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 ${errors.date_of_birth ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth[0]}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="device_uid" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device UID</label>
                        <input
                            type="text"
                            name="device_uid"
                            value={formData.device_uid}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 ${errors.device_uid ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.device_uid && <p className="text-red-500 text-xs mt-1">{errors.device_uid[0]}</p>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="current_location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Residential Address</label>
                        <input
                            type="text"
                            name="current_location"
                            value={formData.current_location}
                            onChange={handleChange}
                            className={`mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 ${errors.current_location ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.current_location && <p className="text-red-500 text-xs mt-1">{errors.current_location[0]}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={`mt-1 text-gray-800 dark:text-gray-200`}
                        />
                        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image[0]}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''} dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-600`}
                    >
                        {loading ? 'Adding...' : 'Add User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddUser;