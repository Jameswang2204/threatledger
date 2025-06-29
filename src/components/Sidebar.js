import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiPlusCircle, FiList, FiFileText } from 'react-icons/fi';

const links = [
  { to: '/', icon: <FiHome />, label: 'Dashboard' },
  { to: '/add-risk', icon: <FiPlusCircle />, label: 'Add Risk' },
  { to: '/view-risks', icon: <FiList />, label: 'View Risks' },
  { to: '/review-export', icon: <FiFileText />, label: 'Review & Export' },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">ThreatLedger</h1>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex items-center p-2 mb-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`
          }
        >
          <div className="text-xl mr-3 text-blue-500">{link.icon}</div>
          <div className="text-gray-800">{link.label}</div>
        </NavLink>
      ))}
    </div>
  );
}