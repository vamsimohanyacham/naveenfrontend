import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'
//import '../src/Components/Leave.js';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTrash, FaEdit, FaMoon, FaSun, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Employee({ employeeId = 'MTL1019' }) {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const navigate = useNavigate();
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(3);


  useEffect(() => {
    fetchLeaveRequests();
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/leave/employee/${employeeId}`);
      // Sort leave requests to put the most recent requests on top
      const leaves = response.data
      setLeaveRequests(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));

    }
    catch (error) {
      console.log("Error fetching in leave requests", error)

    }

  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <FaCheckCircle className="text-green-500" />
      case 'REJECTED':
        return <FaTimesCircle className="text-red-500" />
      default:
        return <FaHourglassHalf className="text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    }
  }



  const handleEditRequest = (request) => {
    navigate("/Leave", {
      state: {
        edit: true,
        ...request // passing all details for editing
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/leave/delete/${id}`);
      setLeaveRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== id)
      );
      alert('Leave request cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      alert('Failed to cancel leave request. Please try again.');
    }
  };

  // Pagination logic
  const total = leaveRequests.length
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentItems = leaveRequests.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(leaveRequests.length / employeesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);



  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Employee Dashboard</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">End Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>

              </tr>
            </thead>

            <tbody>
              {currentItems.map((request => (
                <tr key={request.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-xs">
                    <p className="text-gray-900 dark:text-gray-300 whitespace-nowrap">{request.leaveStartDate}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-xs">
                    <p className="text-gray-900 dark:text-gray-300 whitespace-nowrap">{request.leaveEndDate}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-xs">
                    <p className="text-gray-900 dark:text-gray-300 whitespace-nowrap">{request.leaveType}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-xs">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.leaveStatus)}`}>
                      {getStatusIcon(request.leaveStatus)}
                      <span className="ml-1">{request.leaveStatus}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-xs">
                    {request.leaveStatus === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRequest(request)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaEdit className="mr-1 h-3 w-3" />

                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTrash className="mr-1 h-3 w-3" />

                        </button>
                      </div>
                    )}
                  </td>



                </tr>
              )))}
            </tbody>

          </table>

        </div>
      </div>
     {/* Pagination controls */}
     <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border dark:bg-gray-700 dark:text-gray-300 text-sm font-medium rounded-md text-gray-700 ${darkMode ? "bg-gray-700 text-gray-300" : "bg-white text-gray-700"} hover:bg-gray-50`}
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${darkMode ? "dark:bg-gray-700 dark:text-gray-300 text-gray-300" : "bg-white text-gray-700"} hover:bg-gray-50`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{indexOfFirstEmployee + 1}</span> to <span className="font-medium">{Math.min(indexOfLastEmployee, total)}</span> of <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${darkMode ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-white text-gray-500 border-gray-300"} hover:bg-gray-50`}
              >
                <span className="sr-only">Previous</span>
                <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${index + 1 === currentPage
                      ? `z-10 ${darkMode ? "bg-blue-700 text-white border-blue-500" : "bg-blue-50 text-blue-600 border-blue-500"}`
                      : `${darkMode ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-white text-gray-500 border-gray-300"} hover:bg-gray-50`
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${darkMode ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-white text-gray-500 border-gray-300"} hover:bg-gray-50`}
              >
                <span className="sr-only">Next</span>
                <FaChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}