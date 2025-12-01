import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function TaskPool({ studentId, onTaskAssigned }) {
  const [poolTasks, setPoolTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [newTask, setNewTask] = useState({ aciklama: '', sure: 0 });
  const [bulkTasks, setBulkTasks] = useState(
    Array(15).fill().map(() => ({ aciklama: '', ders: '', konu: '', zorluk: '', sure: 0 }))
  );

  useEffect(() => {
    fetchPoolTasks();
  }, [studentId]);

  const fetchPoolTasks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/task-pool/${studentId}`);
      setPoolTasks(response.data);
    } catch (error) {
      toast.error('Görev havuzu yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.aciklama || newTask.sure <= 0) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/api/task-pool`, {
        student_id: studentId,
        aciklama: newTask.aciklama,
        sure: parseInt(newTask.sure)
      });
      toast.success('Görev havuza eklendi');
      setOpenDialog(false);
      setNewTask({ aciklama: '', sure: 0 });
      fetchPoolTasks();
    } catch (error) {
      toast.error('Görev eklenemedi');
    }
  };

  const handleBulkAdd = async () => {
    const validTasks = bulkTasks.filter(t => t.aciklama.trim() && t.sure > 0);
    
    if (validTasks.length === 0) {
      toast.error('Lütfen en az bir görev girin');
      return;
    }

    try {
      const promises = validTasks.map(task => {
        const taskDescription = task.ders && task.konu 
          ? `${task.ders} - ${task.konu}${task.zorluk ? ' (' + task.zorluk + ')' : ''} - ${task.aciklama}`
          : task.aciklama;

        return axios.post(`${BACKEND_URL}/api/task-pool`, {
          student_id: studentId,
          aciklama: taskDescription,
          sure: parseInt(task.sure)
        });
      });

      await Promise.all(promises);
      toast.success(`${validTasks.length} görev havuza eklendi`);
      setOpenBulkDialog(false);
      setBulkTasks(Array(15).fill().map(() => ({ aciklama: '', ders: '', konu: '', zorluk: '', sure: 0 })));
      fetchPoolTasks();
    } catch (error) {
      toast.error('Görevler eklenemedi');
    }
  };

  const updateBulkTask = (index, field, value) => {
    const updated = [...bulkTasks];
    updated[index][field] = value;
    setBulkTasks(updated);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bu görevi havuzdan silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/task-pool/${taskId}`);
      toast.success('Görev silindi');
      fetchPoolTasks();
    } catch (error) {
      toast.error('Görev silinemedi');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4"><div className="loading-spinner"></div></div>;
  }

  return (
    <Card className="p-4 gradient-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Görev Havuzu</h3>
        <div className="flex gap-2">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="bg-white">
                <Plus className="w-4 h-4 mr-2" />
                Tek Görev
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Havuza Görev Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Görev Açıklaması</label>
                  <Input
                    value={newTask.aciklama}
                    onChange={(e) => setNewTask({ ...newTask, aciklama: e.target.value })}
                    placeholder="Ör: Matematik türev çalış"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Süre (dakika)</label>
                  <Input
                    type="number"
                    value={newTask.sure}
                    onChange={(e) => setNewTask({ ...newTask, sure: e.target.value })}
                    placeholder="60"
                  />
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  Havuza Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Çoklu Ekle (15)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Çoklu Görev Ekle (15&apos;e kadar)</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <p className="text-sm text-gray-600">Boş bırakılan satırlar eklenmeyecek:</p>
                {bulkTasks.map((task, index) => (
                  <Card key={index} className="p-3 bg-gray-50">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-1 text-sm font-semibold text-gray-500">{index + 1}.</span>
                      <Input
                        className="col-span-2"
                        value={task.ders}
                        onChange={(e) => updateBulkTask(index, 'ders', e.target.value)}
                        placeholder="Ders"
                      />
                      <Input
                        className="col-span-2"
                        value={task.konu}
                        onChange={(e) => updateBulkTask(index, 'konu', e.target.value)}
                        placeholder="Konu"
                      />
                      <select
                        className="col-span-2 p-2 border rounded-md text-sm"
                        value={task.zorluk}
                        onChange={(e) => updateBulkTask(index, 'zorluk', e.target.value)}
                      >
                        <option value="">Zorluk</option>
                        <option value="Kolay">Kolay</option>
                        <option value="Orta">Orta</option>
                        <option value="Zor">Zor</option>
                      </select>
                      <Input
                        className="col-span-4"
                        value={task.aciklama}
                        onChange={(e) => updateBulkTask(index, 'aciklama', e.target.value)}
                        placeholder="Görev detayı"
                      />
                      <Input
                        className="col-span-1"
                        type="number"
                        value={task.sure || ''}
                        onChange={(e) => updateBulkTask(index, 'sure', e.target.value)}
                        placeholder="dk"
                      />
                    </div>
                  </Card>
                ))}
                <Button onClick={handleBulkAdd} className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                  Tüm Görevleri Havuza Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2 min-h-[100px]">
        {poolTasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Havuzda görev yok</p>
        ) : (
          poolTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('taskPoolId', task.id);
                e.dataTransfer.setData('taskData', JSON.stringify(task));
              }}
              className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-amber-500 flex items-center justify-between cursor-move hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 flex-1">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{task.aciklama}</p>
                  <p className="text-xs text-gray-500">{task.sure}dk</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTask(task.id)}
                className="p-1"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        💡 Görevleri sürükleyip haftalık günlere atayın
      </p>
    </Card>
  );
}
