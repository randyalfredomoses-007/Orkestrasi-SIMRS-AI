import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AgentVisualization from './components/AgentVisualization';
import { sendMessageToCoordinator } from './services/geminiService';
import { AgentType, Message, Role } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.COORDINATOR);
  const [activeToolData, setActiveToolData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isProcessing) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputValue,
      timestamp: new Date(),
      attachment: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    const tempImage = selectedImage;
    setSelectedImage(null);
    setIsProcessing(true);
    setActiveAgent(AgentType.COORDINATOR);
    setActiveToolData(null);

    try {
      // 2. Call Coordinator
      const response = await sendMessageToCoordinator(userMsg.content, tempImage || undefined);

      // 3. Process Response
      if (response.functionCalls && response.functionCalls.length > 0) {
        const toolCall = response.functionCalls[0];
        const args = toolCall.args;
        
        // Determine which agent handles this
        let targetAgent = AgentType.COORDINATOR;
        let outputText = "";

        switch(toolCall.name) {
          case 'schedule_appointment':
            targetAgent = AgentType.APPOINTMENT;
            outputText = `Appointment Agent is processing request: ${args.action_type} for ${args.specialty || 'General'}. Checking availability...`;
            break;
          case 'manage_patient_records':
            targetAgent = AgentType.PATIENT;
            outputText = `Patient Agent accessing secure records. Operation: ${args.task_type}.`;
            break;
          case 'manage_doctor_data':
            targetAgent = AgentType.DOCTOR;
            outputText = `Doctor Management Agent querying staff database for: ${args.query_type}.`;
            break;
          case 'analyze_medical_query':
            targetAgent = AgentType.MEDICAL_INFO;
            outputText = `Medical Information Agent analyzing clinical context${args.has_image ? ' including visual data' : ''}.`;
            break;
        }

        // Delay slightly to visualize the "handoff"
        setTimeout(() => {
          setActiveAgent(targetAgent);
          setActiveToolData(args);

          const agentMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: Role.SUB_AGENT,
            content: outputText,
            timestamp: new Date(),
            agentName: targetAgent,
            toolPayload: args,
            groundingUrls: response.groundingUrls
          };
          setMessages(prev => [...prev, agentMsg]);
          setIsProcessing(false);
        }, 1000);

      } else if (response.text) {
        // Fallback or explicit refusal
        const coordMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: Role.COORDINATOR,
          content: response.text,
          timestamp: new Date(),
          groundingUrls: response.groundingUrls
        };
        setMessages(prev => [...prev, coordMsg]);
        setIsProcessing(false);
      } else {
          // Should not happen with valid tool calls
          setIsProcessing(false);
      }

    } catch (error) {
      console.error("Error", error);
      setIsProcessing(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.COORDINATOR,
        content: "System Error: Unable to coordinate request.",
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeAgent={activeAgent} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Orkestrator Utama</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              System Online • Gemini 2.5 Flash
            </p>
          </div>
          <div className="text-xs text-gray-400">v2.4.0-Orchestrator</div>
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Intro Message */}
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                  AI
               </div>
               <div className="flex-1">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-700">
                    <p>Halo. Saya adalah <strong>Hospital System Agent</strong>. Saya dapat membantu mengoordinasikan janji temu, data pasien, dan analisis medis. Bagaimana saya bisa membantu Anda hari ini?</p>
                  </div>
               </div>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === Role.USER ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 
                  ${msg.role === Role.USER ? 'bg-gray-800' : 
                    msg.role === Role.SUB_AGENT ? 'bg-teal-600' : 'bg-purple-600'}`}>
                  {msg.role === Role.USER ? 'U' : msg.role === Role.SUB_AGENT ? 'SA' : 'AI'}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${msg.role === Role.USER ? 'flex flex-col items-end' : ''}`}>
                   
                   {msg.agentName && (
                     <div className="text-xs text-gray-400 mb-1 ml-1 flex items-center gap-1">
                        <span>↪ Delegated to:</span>
                        <span className="font-semibold text-teal-600">{msg.agentName}</span>
                     </div>
                   )}

                   <div className={`p-4 rounded-2xl shadow-sm border text-sm
                     ${msg.role === Role.USER 
                       ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none' 
                       : 'bg-white text-gray-700 border-gray-100 rounded-tl-none'}`}>
                      
                      {msg.attachment && (
                        <div className="mb-3">
                          <img src={msg.attachment} alt="Upload" className="max-w-full h-auto rounded-lg border border-white/20" />
                        </div>
                      )}
                      
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100/20">
                          <p className="text-xs font-semibold mb-1 opacity-70">Sources used by Coordinator:</p>
                          <ul className="list-disc list-inside text-xs opacity-70">
                            {msg.groundingUrls.map((url, idx) => (
                              <li key={idx} className="truncate hover:underline cursor-pointer">{new URL(url).hostname}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs flex-shrink-0 animate-pulse">
                    ...
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                       <span className="animate-bounce">●</span>
                       <span className="animate-bounce delay-100">●</span>
                       <span className="animate-bounce delay-200">●</span>
                       <span>Coordinator is thinking...</span>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
           <div className="max-w-3xl mx-auto flex flex-col gap-2">
              {selectedImage && (
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-fit">
                   <span className="text-xs text-gray-600">Image attached</span>
                   <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-red-500">✕</button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Upload Medical Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your request or medical query..."
                    className="w-full border border-gray-300 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    rows={1}
                    style={{minHeight: '44px', maxHeight: '120px'}}
                  />
                </div>

                <button 
                  onClick={handleSendMessage}
                  disabled={isProcessing || (!inputValue && !selectedImage)}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Right Visualization Panel (Hidden on mobile) */}
      <div className="hidden lg:block w-80 xl:w-96 border-l border-gray-200 flex-shrink-0">
         <AgentVisualization agentType={activeAgent} data={activeToolData} />
      </div>
    </div>
  );
}

export default App;