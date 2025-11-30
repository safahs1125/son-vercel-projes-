import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function CoachNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/coach/notes`);
      setNotes(response.data);
    } catch (error) {
      toast.error('Notlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Lütfen başlık ve içerik girin');
      return;
    }

    try {
      if (editingNote) {
        await axios.put(`${BACKEND_URL}/api/coach/notes/${editingNote.id}`, formData);
        toast.success('Not güncellendi');
      } else {
        await axios.post(`${BACKEND_URL}/api/coach/notes`, formData);
        toast.success('Not eklendi');
      }
      setOpenDialog(false);
      setEditingNote(null);
      setFormData({ title: '', content: '' });
      fetchNotes();
    } catch (error) {
      toast.error('Not kaydedilemedi');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/coach/notes/${noteId}`);
      toast.success('Not silindi');
      fetchNotes();
    } catch (error) {
      toast.error('Not silinemedi');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setOpenDialog(true);
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '' });
    setOpenDialog(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) {
            setEditingNote(null);
            setFormData({ title: '', content: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleNewNote} data-testid="add-coach-note" className="bg-gradient-to-r from-violet-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Not
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Notu Düzenle' : 'Yeni Not'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Başlık</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Not başlığı"
                  data-testid="note-title-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">İçerik</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Not içeriği..."
                  rows={8}
                  data-testid="note-content-input"
                />
              </div>
              <Button onClick={handleSaveNote} className="w-full" data-testid="save-note-button">
                {editingNote ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card className="p-12 text-center gradient-card">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz not yok</h3>
          <p className="text-gray-500">İlk notunuzu ekleyerek başlayın</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="p-6 gradient-card card-hover" data-testid={`coach-note-${note.id}`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{note.title}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(note)}
                    data-testid={`edit-note-${note.id}`}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    data-testid={`delete-note-${note.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">{note.content}</p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(note.updated_at || note.created_at).toLocaleDateString('tr-TR')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
