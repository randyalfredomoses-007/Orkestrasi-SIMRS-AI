import React from 'react';
import { AgentType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AgentVisualizationProps {
  agentType: AgentType;
  data: any;
}

const AgentVisualization: React.FC<AgentVisualizationProps> = ({ agentType, data }) => {
  const renderContent = () => {
    switch (agentType) {
      case AgentType.APPOINTMENT:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-blue-800 font-semibold mb-2">Appointment Request Processed</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="block text-gray-500 text-xs">Action</span>
                  <span className="font-medium text-gray-800 capitalize">{data?.action_type || 'Booking'}</span>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="block text-gray-500 text-xs">Specialty</span>
                  <span className="font-medium text-gray-800">{data?.specialty || 'General'}</span>
                </div>
                <div className="bg-white p-3 rounded shadow-sm col-span-2">
                  <span className="block text-gray-500 text-xs">Proposed Time</span>
                  <span className="font-medium text-gray-800">{data?.date_time || 'Next Available Slot'}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
               <h4 className="text-gray-600 text-xs font-bold uppercase mb-4">Slot Availability</h4>
               <div className="flex gap-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="flex-1 p-2 text-center border rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                      <div className="text-xs text-gray-500">Slot {i}</div>
                      <div className="text-sm font-bold text-gray-700">Available</div>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        );

      case AgentType.MEDICAL_INFO:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <h3 className="text-rose-800 font-semibold mb-2">Medical Analysis Agent</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-white rounded text-xs font-bold text-rose-600">AI Analysis</span>
                  <span className="text-sm text-gray-700">Processing clinical query...</span>
                </div>
                {data?.has_image && (
                   <div className="mt-2 p-3 bg-white rounded border border-rose-200 flex items-center gap-3">
                     <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">📷</div>
                     <div className="text-xs text-gray-600">
                       <strong>Image Analysis Active:</strong><br/>
                       Detecting anomalies via Gemini Vision
                     </div>
                   </div>
                )}
              </div>
            </div>
            
            <div className="h-48 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-gray-600 text-xs font-bold uppercase mb-2">Certainty Confidence</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Diagnosis A', value: 85 },
                  { name: 'Diagnosis B', value: 30 },
                  { name: 'Diagnosis C', value: 15 },
                ]}>
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {
                      [0,1,2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#e11d48' : '#fda4af'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case AgentType.PATIENT:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h3 className="text-green-800 font-semibold mb-1">Patient Record Access</h3>
                <p className="text-xs text-green-600 mb-3">HIPAA Compliant Access Logged</p>
                <div className="bg-white p-3 rounded border border-green-200 font-mono text-xs text-gray-600">
                   ACTION: {data?.task_type?.toUpperCase()}<br/>
                   TARGET: {data?.patient_name || 'N/A'}<br/>
                   STATUS: VERIFIED
                </div>
             </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm">Waiting for Coordinator Delegation...</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-hidden">
      <div className="h-full flex flex-col">
         <h2 className="text-lg font-bold text-gray-800 mb-6">Agent Workspace</h2>
         <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
            {renderContent()}
         </div>
      </div>
    </div>
  );
};

export default AgentVisualization;