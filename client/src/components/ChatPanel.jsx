import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/featuresService.js';
import { Send, Loader2, Bot, User, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatPanel = ({ workspaceId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [workspaceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await chatService.getMessages(workspaceId);
      setMessages(res.data.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, _id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatService.sendMessage(workspaceId, userMessage.content);
      setMessages(prev => [...prev.filter(m => m._id !== userMessage._id), res.data.data.userMessage, res.data.data.assistantMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gray-50 dark:bg-[#151515] p-4 border-b border-gray-200 dark:border-gray-800/80">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          <Bot className="w-4 h-4 text-gray-500" />
          Research Assistant
        </h3>
        <p className="text-xs text-gray-500 mt-1 pl-6">Ask questions about your research findings and documents.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20 text-sm">
            <Bot className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            No messages yet. Ask me to summarize findings or search documents.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={msg._id || idx} className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-900 dark:bg-white' : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white dark:text-gray-900" /> : <Bot className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />}
            </div>
            <div className={`rounded-2xl px-5 py-3.5 text-sm ${msg.role === 'user' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-tr-sm' : 'bg-gray-50 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-tl-sm'}`}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({node, href, ...props}) => {
                      const safeHref = href?.startsWith('http') ? href : `https://${href}`;
                      return <a href={safeHref} {...props} target="_blank" rel="noopener noreferrer" />;
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Citations
                  </p>
                  {msg.sources.map((s, i) => {
                    const isValidLink = s.url && !s.isSimulated && s.url.startsWith('http');
                    return (
                      <div key={i} className="text-xs bg-white dark:bg-[#111] p-2.5 rounded border border-gray-200 dark:border-gray-800">
                        {isValidLink ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {s.title}
                          </a>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-200">{s.title}</span>
                            {s.isSimulated && (
                              <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] uppercase tracking-wider font-semibold rounded border border-amber-200 dark:border-amber-900/50">
                                Simulated
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-gray-500 mt-1 line-clamp-2 leading-relaxed">{s.snippet}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-50 dark:bg-[#151515] border-t border-gray-200 dark:border-gray-800/80">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your research..."
            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white transition-shadow shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-gray-900 rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
