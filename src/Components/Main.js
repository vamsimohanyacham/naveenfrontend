import React from "react"
import { Link } from "react-router-dom"

export default function Main(){
    return(
        <div className="container max-w-md mx-auto p-4 rounded-lg shadow-lg space-y-4 mt-10 flex justify-evenly items-center">
            <Link to="/leave">
            <button className="text-black-100 bg-gray-200 p-4 rounded">Leave Request</button>
            </Link>
            <Link to="/admin">
            <button className="text-gray-200 bg-black p-4 rounded">Manager dashboard</button>
            </Link>
        </div>
    )
}