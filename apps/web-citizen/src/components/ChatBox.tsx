'use client';
import { useState, useEffect, useRef } from 'react';
import { incidentsApi } from '../lib/apiClient';
import { joinIncidentRoom, leaveIncidentRoom, getSocket } from '../lib/socket';

interface Props {
  incidentId: string;
  initialNotes?: any[];
  userId?: string;
}

export function ChatBox({ incidentId, initialNotes = [], userId }: Props) {
  const [notes, setNotes] = useState<any[]>(initialNotes);
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    joinIncidentRoom(incidentId);
    const socket = getSocket();
    socket.on('message:new', (note: any) => {
      if (!note.isInternal) setNotes((prev) => [...prev, note]);
    });
    return () => { leaveIncidentRoom(incidentId); socket.off('message:new'); };
  }, [incidentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await incidentsApi.addNote(incidentId, message);
      setMessage('');
    } catch { /* show error */ }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 rounded-t-lg">
        {notes.filter((n) => !n.isInternal).map((note, i) => {
          const isMine = note.author?.id === userId;
          return (
            <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${isMine ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                <p className={`text-xs font-semibold mb-1 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                  {isMine ? 'You' : note.author?.name ?? 'Officer'}
                </p>
                {note.note}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-3 border border-t-0 border-gray-200 rounded-b-lg bg-white">
        <input
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-800 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-900">
          Send
        </button>
      </div>
    </div>
  );
}
