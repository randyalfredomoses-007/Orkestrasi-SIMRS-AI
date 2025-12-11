import React from 'react';
import { AgentType } from '../types';

interface SidebarProps {
  activeAgent: AgentType;
}

const Sidebar: React.FC<SidebarProps> = ({ activeAgent }) => {
  const agents = [
    { type: AgentType.COORDINATOR, icon: "🧠", color: "bg-purple-100 text-purple-700" },
    { type: AgentType.APPOINTMENT, icon: "📅", color: "bg-blue-100 text-blue-700" },
    { type: AgentType.PATIENT, icon: "👤", color: "bg-green-100 text-green-700" },
    { type: AgentType.DOCTOR, icon: "👨‍⚕️", color: "bg-teal-100 text-teal-700" },
    { type: AgentType.MEDICAL_INFO, icon: "🔬", color: "bg-rose-100 text-rose-700" },
  ];

  return (
    <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🏥</span> SIMRS AI
        </h1>
        <p className="text-xs text-gray-500 mt-1">Orkestrasi Digital RS</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Agents</h3>
        {agents.map((agent) => (
          <div
            key={agent.type}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              activeAgent === agent.type
                ? `${agent.color} shadow-sm ring-1 ring-inset ring-gray-200`
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{agent.icon}</span>
            <span className="text-sm font-medium">{agent.type === AgentType.COORDINATOR ? 'Coordinator' : agent.type.replace(' Agent', '')}</span>
            {activeAgent === agent.type && (
              <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 mb-3">Performance Metrics</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Admin Efficiency</span>
              <span className="text-green-600 font-bold">+45%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[75%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Burnout Reduction</span>
              <span className="text-blue-600 font-bold">-29%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[60%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;