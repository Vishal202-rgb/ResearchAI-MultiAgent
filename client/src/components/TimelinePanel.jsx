import { Clock, Calendar } from 'lucide-react';

const TimelinePanel = ({ sources }) => {
  // Sort sources by date if available
  const timelineEvents = [...(sources || [])]
    .filter(s => s.publishedDate || (s.snippet && s.snippet.match(/20\d{2}/)))
    .map(s => {
      let date = s.publishedDate;
      if (!date) {
        const match = s.snippet.match(/(20\d{2}(?:-\d{2}-\d{2})?)/);
        date = match ? match[0] : 'Unknown';
      }
      return { ...s, parsedDate: new Date(date).getTime() || 0, displayDate: date };
    })
    .sort((a, b) => b.parsedDate - a.parsedDate);

  if (timelineEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center shadow-sm">
        <Clock className="w-8 h-8 mx-auto text-gray-400 mb-3" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No Timeline Events</h3>
        <p className="text-xs text-gray-500 mt-1">No sources with clear dates found in this research run.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-gray-500" />
        Research Timeline
      </h3>
      
      <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-8 pb-4">
        {timelineEvents.map((event, idx) => (
          <div key={idx} className="relative pl-6">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#111] rounded-full" />
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              {event.displayDate}
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{event.snippet}</p>
            {event.url && (
              <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                View Source &rarr;
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelinePanel;
