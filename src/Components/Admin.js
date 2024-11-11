import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaSun, FaMoon, FaChevronLeft, FaChevronRight} from "react-icons/fa";

export default function LeaveApprovalDashboard({managerId = 8}) {
  const [Data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [count, setCount] = useState(0);
  const [statusCount, setStatusCount] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState({}); //state to track editing
  //state varaiables for managing modal, rejection reason, and leave date
  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };
  
  // open modal and set selected leave ID
  const openRejectModal = (id) => {
    setSelectedLeaveId(id);
    setShowModal(true);
  };
  
  // close the modal reset reason
  const closeModal = () => {
    setShowModal(false);
    setRejectionReason("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
       
        const response = await axios.get(`http://localhost:8080/leave/manager/${managerId}`);
        const leaves = response.data;
        // Sort leaves with new entries at the top
        setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id))); // Assuming 'createdAt' is available
        setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
        const total = leaves.length;
        const pending = leaves.filter(leave => leave.leaveStatus === 'PENDING').length;
        const approved = leaves.filter(leave => leave.leaveStatus === 'APPROVED').length;
        const rejected = leaves.filter(leave => leave.leaveStatus === 'REJECTED').length;

        setCount(total);
        setStatusCount({ pending, approved, rejected });
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:8080/leave/approve/${id}`);
      const response = await axios.get(`http://localhost:8080/leave/manager/${managerId}`);
      const leaves = response.data;
      // Sort leaves with new entries at the top
      setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setIsEditing({ ...isEditing, [id]: false }); //exit edit mode after approval
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
  };
  
  // Handle rejection with backend integration
  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      console.log(rejectionReason);
      await axios.put(`http://localhost:8080/leave/reject/${selectedLeaveId}/${rejectionReason}`);
      const response = await axios.get(`http://localhost:8080/leave/manager/${managerId}`);
      const leaves = response.data;
      // Sort leaves with new entries at the top
      setData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setFilteredData(leaves.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id)));
      setRejectionReason(response.data)
      setIsEditing({ ...isEditing, [selectedLeaveId]: false }); // exit edit mode after rejection

      // Optionally refresh data here (for instance, refetch the leave data)
      // Close modal after rejection
      closeModal();
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  const filterByStatus = (status) => {
    if (status === 'ALL') {
      setFilteredData(Data);
    } else {
      const filtered = Data.filter(leave => leave.leaveStatus === status);
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page on filter change
  };

  const toggleEdit = (id) => {
    setIsEditing({ ...isEditing, [id]: !isEditing[id] });
  }



  /*Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : [];
 
  const totalPages = filteredData ? Math.ceil(filteredData.length / itemsPerPage) : 1;
  */

  // Pagination logic
  const total = filteredData.length
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentItems = filteredData.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredData.length / employeesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  

  

  return (
    <div className={` ${darkMode ? "dark:bg-gray-800" : ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-center dark:text-gray-400">LEAVE APPROVAL DASHBOARD</h1>
        <button
          className="text-2xl p-2 rounded-full"
          onClick={toggleDarkMode}
        >
          {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-300 p-4 dark:bg-gray-800 dark:text-white">
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-gray-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('ALL')}>Total Requests</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-yellow-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('PENDING')}>Pending</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-blue-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('APPROVED')}>Approved</button>
        </div>
        <div className="text-center text-sm font-bold p-2">
          <button className="bg-red-500 text-white rounded-lg text-xs px-4 py-2" onClick={() => filterByStatus('REJECTED')}>Rejected</button>
        </div>
        <div className='text-center text-sm'>{count}</div>
        <div className='text-center text-sm'>{statusCount.pending}</div>
        <div className='text-center text-sm'>{statusCount.approved}</div>
        <div className='text-center text-sm'>{statusCount.rejected}</div>
      </div>

      {/* Leave Requests Table */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-7 bg-gray-100 dark:bg-gray-900 dark:text-white">
          <div className="col-span-7 text-center text-md font-bold p-2 bg-gray-200 dark:bg-gray-700 dark:text-white">LEAVE REQUESTS</div>

          {/* Table Header */}
          <div className="p-2 border-b border-gray-300 text-center text-sm font-bold dark:text-gray-300">Employee</div>
          <div className="p-2 border-b border-gray-300 text-center text-sm font-bold dark:text-gray-300">Employee ID</div>
          <div className="p-2 border-b border-gray-300 text-center text-sm font-bold dark:text-gray-300">Start Date</div>
          <div className="p-2 border-b border-gray-300 text-center text-sm font-bold dark:text-gray-300">End Date</div>
          <div className="p-2 border-b border-gray-300 text-center text-sm font-bold dark:text-gray-300">Days</div>
          <div className="p-2 border-b border-gray-300 text-center text-sm font-bold dark:text-gray-300">Status</div>
          <div className="p-2 border-b border-gray-300 text-center text-sm font-bold dark:text-gray-300">Action</div>
        </div>

        {/* Table Body */}
        {filteredData !== null && currentItems.map((data) => (
          <div key={data.id} className="grid grid-cols-1 sm:grid-cols-7 text-center p-2 border-b border-gray-200 items-center bg-gray-100 dark:bg-gray-800 dark:text-white">
            <div className="p-2 text-xs">{data.firstName}</div>
            <div className="p-2 text-xs">{data.employeeId}</div>
            <div className="p-2 text-xs">{data.leaveStartDate}</div>
            <div className="p-2 text-xs">{data.leaveEndDate}</div>
            <div className="p-2 text-xs">{data.duration}</div>
            <div className={`p-2 text-xs flex items-center justify-center space-x-1 ${data.leaveStatus === 'APPROVED' ? 'text-green-600 dark:text-green-400' : data.leaveStatus === 'PENDING' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {data.leaveStatus === 'APPROVED' ? <FaCheckCircle /> : data.leaveStatus === 'PENDING' ? <FaHourglassHalf /> : <FaTimesCircle />}
              {data.leaveStatus}
            </div>
            <div className="p-2 flex justify-center space-x-2">
              {/* Show Approve/Reject buttons if pending, else show Edit button */}
              {data.leaveStatus === 'PENDING' ? (
                <>
                  <button className="bg-green-500 text-white text-xs px-3 py-2 rounded" onClick={() => handleApprove(data.id)}>Approve</button>
                  <button className="bg-red-500 text-white text-xs px-3 py-2 rounded" onClick={() => openRejectModal(data.id)}>Reject</button>
                </>
              ) : (
                isEditing[data.id] ? (
                  <>
                    <button className="bg-green-500 text-white text-xs px-3 py-2 rounded" onClick={() => handleApprove(data.id)}>Approve</button>
                    <button className="bg-red-500 text-white text-xs px-3 py-2 rounded" onClick={() => openRejectModal(data.id)}>Reject</button>
                  </>
                ) : (
                  <button className="bg-blue-500 text-white text-xs px-3 py-2 rounded" onClick={() => toggleEdit(data.id)}>Edit</button>
                )
              )}
            </div>
          </div>
        ))}
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
      {/* Rejection Reason Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-75">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md w-11/12 sm:w-1/3">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Reject Leave Request</h2>
            <textarea
              name='leaveReason'
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectionReason.leaveReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2 mt-4">
              <button className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded" onClick={closeModal}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleReject}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




/*<div>
        <h1 className='text-md font-bold'>Leave Requests</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-bold">Employee</TableHead>
              <TableHead className="text-sm font-bold">Employee ID</TableHead>
              <TableHead className="text-sm font-bold">Start Date</TableHead>
              <TableHead className="text-sm font-bold">End Date</TableHead>
              <TableHead className="text-sm font-bold">Days</TableHead>
              <TableHead className="text-sm font-bold">Status</TableHead>
              <TableHead className="text-sm font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData !== null && filteredData.map((data) => (
              <TableItem key={data.id} data={data} handleApprove={handleApprove} handleReject={() => openRejectModal(data.id)} />
            ))}
          </TableBody>
        </Table>
      </div>
      */

/*
<div className="flex justify-center mt-4">
  {Array.from({ length: totalPages }, (_, index) => (
    <button
      key={index + 1}
      className={`px-4 py-2 border ${index + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setCurrentPage(index + 1)}
    >
      {index + 1}
    </button>
  ))}
</div>
*/