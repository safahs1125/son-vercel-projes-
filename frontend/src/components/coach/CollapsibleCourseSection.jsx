import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

export default function CollapsibleCourseSection({ 
  title, 
  topics, 
  onUpdateStatus, 
  onDeleteTopic,
  sinavType 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getBadgeColor = () => {
    return sinavType === 'TYT' 
      ? 'bg-gradient-to-r from-blue-500 to-cyan-600' 
      : 'bg-gradient-to-r from-violet-500 to-purple-600';
  };

  return (
    <Card className="gradient-card overflow-hidden">
      {/* Header - Clickable */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={`course-header-${title}`}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
          <span className={`px-3 py-1 rounded-lg text-white text-xs font-semibold ${getBadgeColor()}`}>
            {sinavType}
          </span>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <span className="text-sm text-gray-500">({topics.length} konu)</span>
        </div>
      </div>

      {/* Content - Collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-4 pt-0 space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
              data-testid={`topic-item-${topic.id}`}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{topic.konu}</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={topic.durum} onValueChange={(value) => onUpdateStatus(topic.id, value)}>
                  <SelectTrigger className="w-[180px]" data-testid={`topic-status-${topic.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baslanmadi">
                      <span className="status-badge status-baslanmadi">Başlanmadı</span>
                    </SelectItem>
                    <SelectItem value="devam">
                      <span className="status-badge status-devam">Devam Ediyor</span>
                    </SelectItem>
                    <SelectItem value="tamamlandi">
                      <span className="status-badge status-tamamlandi">Tamamlandı</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTopic(topic.id);
                  }}
                  data-testid={`delete-topic-${topic.id}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
