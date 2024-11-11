import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaSun, FaMoon } from "react-icons/fa";

function LeaveRequestForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    managerId: '',
    managerEmail: 'raja@gmail.com',
    phone: '',
    position: '',
    manager: 'Raja',
    leaveRequestFor: 'Days',
    leaveType: '',
    leaveStartDate: '',
    leaveEndDate: '',
    duration: '',
    comments: ''
  });
  const [errors, setErrors] = useState(false);
  const [isCommentsEnabled, setIsCommentsEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [isEditing, setIsEditing] = useState(false);
  const [leaveError, setLeaveError] = useState(''); // To set leave balance error from backend
  const [loading, setLoading] = useState(false);
  const publicHolidays = ['2024-11-01', '2024-12-25']; // Example of public holidays

  useEffect(() => {
    if (location.state && location.state.edit) {
      setIsEditing(true);
      setFormData(location.state);
    }
  }, [location.state]);

  const isPublicHoliday = (date) => {
    return publicHolidays.includes(date.toISOString().split('T')[0]);
  };

  const calculateDuration = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      let totalDays = 0;
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const day = date.getDay();
        // Count only weekdays that are not public holidays
        if (day !== 0 && day !== 6 && !isPublicHoliday(date)) {
          totalDays++;
        }
      }
      return totalDays;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'leaveType') {
      setIsCommentsEnabled(value === 'OTHERS');
    }

    if (name === 'leaveStartDate' || name === 'leaveEndDate') {
      const duration = calculateDuration(
        name === 'leaveStartDate' ? value : formData.leaveStartDate,
        name === 'leaveEndDate' ? value : formData.leaveEndDate
      );
      setFormData(prevData => ({
        ...prevData,
        duration
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLeaveError('');
    // Reset leave error

    // Check if the email is valid
  const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|middlewaretalents\.com)$/;
  if (!emailPattern.test(formData.email)) {
    setLeaveError('Please enter a valid email address from @gmail.com or @middlewaretalents.com');
    setErrors(true);
    return;
  }
    

   
    if (
      formData.firstName === '' ||
      formData.lastName === '' ||
      formData.employeeId === '' ||
      formData.email === '' ||
      formData.managerId === '' ||
      formData.manager === '' ||
      formData.managerEmail === '' ||
      formData.position === '' ||
      formData.leaveStartDate === '' ||
      formData.leaveEndDate === '' || // Include leaveEndDate in the validation
      formData.leaveType === '' || // Include leaveType in the validation
      formData.duration === ''
    ) {

      setErrors(true);
      return;
    }

    setLoading(true);

     


    try {

      const url = isEditing
        ? `http://localhost:8080/leave/update/${formData.id}`
        : `http://localhost:8080/leave/submit`;

      const response = await axios({
        method: isEditing ? 'PUT' : 'POST',
        url,
        data: formData,
      });


      if (response.status === 200) {
        navigate('/employee');
      } else {
        setLeaveError('Error processing the request. Please try again.');
      }
    } catch (error) {
      setLeaveError('Error submitting the form.');
      setErrors(true);
      setLeaveError(error.response.data.message || 'Error occurred');
    }
    setLoading(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`mt-0 mb-0 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h1 className="text-2xl font-semibold text-center font-Playfair-Display">
        {isEditing ? 'EDIT LEAVE REQUEST' : 'NEW LEAVE REQUEST'}
      </h1>

      {/* Theme Toggle Button */}
      <button className="text-2xl p-2 rounded-full" onClick={toggleTheme}>
        {isDarkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
      </button>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 rounded-lg shadow-lg space-y-4 mt-10">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="firstName" className="mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.firstName}
            />
            {errors && formData.firstName === '' && <span className="text-red-600 text-sm">First Name is required</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="lastName" className="mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.lastName}
            />
            {errors && formData.lastName === '' && <span className="text-red-600 text-sm">Last Name is required</span>}
          </div>
        </div>

        {/* Employee ID */}
        <div className="flex flex-col">
          <label htmlFor="employeeId" className="mb-1">Employee ID</label>
          <input
            type="text"
            name="employeeId"
            className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
            onChange={handleChange}
            value={formData.employeeId}
          />
          {errors && formData.employeeId === '' && <span className="text-red-600 text-sm">Employee ID is required</span>}
        </div>

        {/* Email and Position */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1">Email</label>
            <input
              type="email"
              name="email"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.email}
            />
            {errors && formData.email === '' && <span className="text-red-600 text-sm">Email is required</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="position" className="mb-1">Position</label>
            <input
              type="text"
              name="position"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.position}
            />
            {errors && formData.position === '' && <span className="text-red-600 text-sm">Position is required</span>}
          </div>
        </div>

        {/* Manager Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="managerId" className="mb-1">Manager ID</label>
            <input
              type="text"
              name="managerId"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.managerId}
            />
            {errors && formData.managerId === '' && <span className="text-red-600 text-sm">Manager ID is required</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="managerEmail" className="mb-1">Manager Email</label>
            <input
              type="email"
              name="managerEmail"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.managerEmail}
              readOnly
            />
          </div>
        </div>

        {/* Leave Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="leaveStartDate" className="mb-1">Leave Start Date</label>
            <input
              type="date"
              name="leaveStartDate"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.leaveStartDate}
            />
            {errors && formData.leaveStartDate === '' && <span className="text-red-600 text-sm">Start Date is required</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="leaveEndDate" className="mb-1">Leave End Date</label>
            <input
              type="date"
              name="leaveEndDate"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.leaveEndDate}
            />
            {errors && formData.leaveEndDate === '' && <span className="text-red-600 text-sm">End Date is required</span>}
          </div>
        </div>

        {/* Duration */}
        <div className="flex flex-col">
          <label htmlFor="duration" className="mb-1">Duration (Days)</label>
          <input
            type="text"
            name="duration"
            className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
            value={formData.duration}
            readOnly
          />
          {errors && formData.duration === '' && <span className="text-red-600 text-sm">Duration is required</span>}
        </div>

        {/* Leave Type */}
        <div className="flex flex-col">
          <label htmlFor="leaveType" className="mb-1">Leave Type</label>
          <select
            name="leaveType"
            className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
            onChange={handleChange}
            value={formData.leaveType}
          >
            <option value="">Select Leave Type</option>
            <option value="SICK">Sick Leave</option>
            <option value="CASUAL">Casual Leave</option>
            <option value="VACATION">Vacation Leave</option>
            <option value="OTHERS">Others</option>
          </select>
          {errors && formData.leaveType === '' && <span className="text-red-600 text-sm">Leave Type is required</span>}
        </div>

        {/* Comments for "OTHERS" Leave Type */}
        {isCommentsEnabled && (
          <div className="flex flex-col">
            <label htmlFor="comments" className="mb-1">Comments</label>
            <textarea
              name="comments"
              rows="4"
              className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
              onChange={handleChange}
              value={formData.comments}
            ></textarea>
          </div>
        )}

        {leaveError && <span className="text-red-600 text-sm">{leaveError}</span>}

        <button
          type="submit"
          className={`w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-700 focus:outline-none text-sm`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : isEditing ? 'Update Leave' : 'Submit Leave'}
        </button>
      </form>
    </div>
  );
}

export default LeaveRequestForm;
