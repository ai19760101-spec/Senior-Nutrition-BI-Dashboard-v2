import React, { useState, useEffect } from 'react';
import { Search, X, User, Fingerprint, Loader2, Calendar } from 'lucide-react';

interface Patient {
  id: string;
  name?: string;
  assessment_date: string;
}

interface PatientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string, date: string) => void;
}

const PatientSearchModal: React.FC<PatientSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('無法取得個案清單，請確認 VPN 已開啟。');
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '連線失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">選擇搜尋個案</h3>
            <p className="text-xs text-slate-500 font-medium">從現有評估資料庫中按日期選取</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="搜尋姓名或身分證字號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-medium">資料庫掃描中...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 rounded-2xl mx-2 border border-red-100">
              <p className="text-red-500 font-bold text-sm">{error}</p>
              <button onClick={fetchPatients} className="mt-3 text-xs font-black text-red-600 hover:underline">重新整理</button>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic">
              <p className="text-sm">找不到符合條件的個案</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredPatients.map((p, idx) => (
                <button
                  key={`${p.id}-${p.assessment_date}-${idx}`}
                  onClick={() => {
                    onSelect(p.id, p.assessment_date);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-indigo-50 rounded-2xl transition group text-left border border-transparent hover:border-indigo-100"
                >
                  <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-white transition shadow-sm">
                    <User className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800 group-hover:text-indigo-900">
                      {p.name || '未命名個案'}
                    </p>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                        <Fingerprint className="w-3 h-3" />
                        {p.id}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-black">
                        <Calendar className="w-3 h-3" />
                        評估日期: {new Date(p.assessment_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition translate-x-1 group-hover:translate-x-0">
                    <span className="text-[10px] font-black bg-indigo-600 text-white py-1 px-3 rounded-full">帶入日期</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSearchModal;
