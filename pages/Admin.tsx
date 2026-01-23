import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Trash2, X, Image as ImageIcon, Check, Tag, User, Clock, Pencil, LayoutDashboard, Calendar, Camera } from 'lucide-react';
import { dataService } from '../services/dataService';
import { PickleballEvent, PhotoUploadDraft } from '../types';
import { AdminChart } from '../components/AdminChart';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Dashboard State
  const [events, setEvents] = useState<PickleballEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [newEvent, setNewEvent] = useState<Partial<PickleballEvent>>({
    title: '',
    date: '',
    location: '',
    description: '',
    coverImage: '',
    organizer: '',
    category: '',
    status: 'completed',
    tags: []
  });
  const [tagsInput, setTagsInput] = useState('');
  
  // Cover Image State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // Photo Upload State
  const [uploadEventId, setUploadEventId] = useState<string | null>(null);
  const [stagedFiles, setStagedFiles] = useState<PhotoUploadDraft[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dataService.isAdmin()) {
      setIsAuthenticated(true);
      loadDashboard();
    }
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const data = await dataService.getEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataService.login(password)) {
      setIsAuthenticated(true);
      loadDashboard();
    } else {
      alert('Senha incorreta!');
    }
  };

  const openEditModal = (event: PickleballEvent) => {
    setEditingId(event.id);
    setNewEvent({
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        coverImage: event.coverImage,
        organizer: event.organizer,
        category: event.category,
        status: event.status,
    });
    setCoverPreview(event.coverImage); // Set existing image as preview
    setCoverFile(null);
    setTagsInput(event.tags ? event.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setNewEvent({ 
        title: '', 
        date: '', 
        location: '', 
        description: '', 
        coverImage: '', 
        organizer: '', 
        category: '', 
        status: 'completed' 
    });
    setCoverPreview(null);
    setCoverFile(null);
    setTagsInput('');
    setIsModalOpen(true);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.location) return;

    setLoading(true);
    
    // Process tags
    const processedTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    try {
        let finalCoverUrl = newEvent.coverImage;

        // Upload cover if a new file exists
        if (coverFile) {
            finalCoverUrl = await dataService.uploadCoverImage(coverFile);
        } else if (!finalCoverUrl) {
            // Placeholder if no image provided at all
            finalCoverUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(newEvent.title || 'Event')}&background=CCFF00&color=0f172a&size=800`;
        }

        const eventData = {
            title: newEvent.title,
            date: newEvent.date,
            location: newEvent.location,
            description: newEvent.description || '',
            organizer: newEvent.organizer || 'PickleballBH',
            category: newEvent.category || 'Geral',
            status: newEvent.status || 'completed',
            tags: processedTags,
            coverImage: finalCoverUrl
        };

        if (editingId) {
            await dataService.updateEvent(editingId, eventData);
        } else {
            await dataService.createEvent(eventData as any);
        }
        await loadDashboard();
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error saving event", error);
        alert("Erro ao salvar evento");
    }
    
    setLoading(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento? Todas as fotos serão perdidas.')) {
        await dataService.deleteEvent(id);
        await loadDashboard();
    }
  };

  // --- Photo Upload Logic ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !uploadEventId) return;
    
    const files = Array.from(e.target.files) as File[];
    const newDrafts: PhotoUploadDraft[] = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        caption: '',
        tags: ''
    }));

    setStagedFiles(prev => [...prev, ...newDrafts]);
    setIsUploadModalOpen(true);
    
    // Reset input so same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateDraft = (index: number, field: keyof PhotoUploadDraft, value: string) => {
    const updated = [...stagedFiles];
    updated[index] = { ...updated[index], [field]: value };
    setStagedFiles(updated);
  };

  const removeDraft = (index: number) => {
    const updated = [...stagedFiles];
    URL.revokeObjectURL(updated[index].preview); // Cleanup memory
    updated.splice(index, 1);
    setStagedFiles(updated);
    if (updated.length === 0) setIsUploadModalOpen(false);
  };

  const confirmUpload = async () => {
    if (!uploadEventId || stagedFiles.length === 0) return;
    
    setLoading(true);
    try {
        await dataService.uploadPhotos(uploadEventId, stagedFiles);
        // Cleanup previews
        stagedFiles.forEach(d => URL.revokeObjectURL(d.preview));
        setStagedFiles([]);
        setIsUploadModalOpen(false);
        setUploadEventId(null);
        await loadDashboard();
        alert("Fotos enviadas com sucesso!");
    } catch (error) {
        alert("Erro ao enviar fotos.");
        console.error(error);
    }
    setLoading(false);
  };

  // --- Auth View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-6">
             <div className="inline-block p-3 rounded-full bg-pickle/20 mb-4">
                <User className="w-8 h-8 text-pickle-700" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900">Acesso Administrativo</h2>
             <p className="text-sm text-gray-500 mt-2">Área restrita para gestão do PickleballBH</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Acesso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pickle-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-pickle-600 text-white py-3 rounded-lg hover:bg-pickle-700 transition-colors font-bold uppercase tracking-wider text-sm shadow-md"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Main Dashboard ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-display uppercase tracking-wide">Painel de Controle</h1>
                        <p className="text-gray-500 text-xs mt-0.5 font-medium uppercase tracking-wider">Gestão PickleballBH</p>
                    </div>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="mt-4 md:mt-0 bg-pickle text-brand-dark px-6 py-3 rounded-xl flex items-center hover:bg-pickle-400 transition-all shadow-lg hover:shadow-xl font-bold uppercase text-xs tracking-wider transform active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Evento
                </button>
            </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-pickle-600" />
                    Visão Geral
                </h3>
            </div>
            <AdminChart events={events} />
        </div>

        {/* Events List */}
        <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="text-lg font-bold text-gray-800">Seus Eventos</h3>
             <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1 rounded-full">{events.length}</span>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading && events.length === 0 ? (
                 <div className="p-16 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-pickle border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando dados...</p>
                 </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {events.map(event => (
                        <li key={event.id} className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-start space-x-5 w-full md:w-auto">
                                    <div className="relative flex-shrink-0">
                                        <img 
                                            src={event.coverImage} 
                                            alt="thumb" 
                                            className="w-24 h-24 rounded-2xl object-cover bg-gray-200 shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className={`absolute -top-2 -right-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-white shadow-md ${event.status === 'live' ? 'bg-red-500 animate-pulse' : event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-800'}`}>
                                            {event.status === 'live' ? 'Ao Vivo' : event.status === 'upcoming' ? 'Em Breve' : 'Finalizado'}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xl font-bold text-gray-900 font-display uppercase tracking-tight truncate pr-4">{event.title}</h4>
                                        <div className="flex flex-wrap gap-y-1 gap-x-3 mt-1.5 text-sm text-gray-500 font-medium">
                                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                                            <span className="text-gray-300">|</span>
                                            <span>{event.location}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-pickle-700">{event.category}</span>
                                        </div>
                                        <div className="flex items-center mt-3 gap-2">
                                             <div className="flex items-center text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md">
                                                <ImageIcon className="w-3 h-3 mr-1.5" />
                                                {event.totalPhotos || 0} fotos
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                    <button 
                                        onClick={() => {
                                            setUploadEventId(event.id);
                                            fileInputRef.current?.click();
                                        }}
                                        disabled={loading}
                                        className="flex-1 md:flex-none items-center justify-center px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-pickle hover:text-brand-dark transition-all text-sm font-bold shadow-sm flex gap-2 border border-gray-900"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload
                                    </button>
                                    
                                    <button 
                                        onClick={() => openEditModal(event)}
                                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200 bg-white"
                                        title="Editar Evento"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>

                                    <button 
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200 bg-white"
                                        title="Excluir Evento"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {!loading && events.length === 0 && (
                <div className="py-20 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                        <Plus className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-bold text-lg">Nenhum evento encontrado</p>
                    <p className="text-gray-500 text-sm mt-1">Crie o primeiro evento para começar a galeria.</p>
                    <button onClick={openCreateModal} className="mt-6 text-pickle-600 font-bold text-sm hover:underline uppercase tracking-wide">Criar Novo Evento</button>
                </div>
            )}
        </div>
      </div>

      {/* Hidden File Input for Batch Upload */}
      <input 
        type="file" 
        multiple 
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {/* Hidden Input for Cover Image */}
      <input 
        type="file" 
        accept="image/*"
        ref={coverInputRef}
        className="hidden"
        onChange={handleCoverSelect}
      />

      {/* MODAL: Create/Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] border border-gray-200 animate-[fadeIn_0.2s_ease-out]">
                {/* Modal Header */}
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 font-display uppercase tracking-wide">
                            {editingId ? 'Editar Evento' : 'Novo Evento'}
                        </h3>
                        <p className="text-xs text-gray-500">{editingId ? 'Atualize as informações' : 'Preencha os detalhes'}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Modal Content - Scrollable */}
                <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                    <form id="eventForm" onSubmit={handleSaveEvent} className="space-y-6">
                        {/* Cover Image Upload Area */}
                        <div className="col-span-2">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Capa do Evento</label>
                             <div 
                                onClick={() => coverInputRef.current?.click()}
                                className={`relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${coverPreview ? 'border-pickle-500 bg-gray-900' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
                             >
                                {coverPreview ? (
                                    <>
                                        <img src={coverPreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="relative z-10 flex flex-col items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 mb-2 drop-shadow-md" />
                                            <span className="text-xs font-bold uppercase tracking-wider shadow-black drop-shadow-md">Trocar Imagem</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Toque para adicionar capa</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Recomendado: 1200x600</p>
                                    </>
                                )}
                             </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome do Evento</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none font-medium"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                    placeholder="Ex: Super8 Open 2024"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data</label>
                                <input 
                                    required
                                    type="date" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none"
                                    value={newEvent.date}
                                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                                <select 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none"
                                    value={newEvent.status}
                                    onChange={e => setNewEvent({...newEvent, status: e.target.value as any})}
                                >
                                    <option value="upcoming">Em Breve</option>
                                    <option value="live">Ao Vivo</option>
                                    <option value="completed">Finalizado</option>
                                </select>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none"
                                    value={newEvent.category}
                                    onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                                    placeholder="Ex: Open / 50+"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Local</label>
                                <div className="relative">
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none pl-10"
                                        value={newEvent.location}
                                        onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                                        placeholder="Ex: Arena BH"
                                    />
                                    <div className="absolute left-3 top-3.5 text-gray-400">
                                        <ImageIcon className="w-5 h-5" /> 
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Organizador</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none"
                                    value={newEvent.organizer}
                                    onChange={e => setNewEvent({...newEvent, organizer: e.target.value})}
                                    placeholder="Ex: PickleballBH"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none"
                                    value={tagsInput}
                                    onChange={e => setTagsInput(e.target.value)}
                                    placeholder="João, Maria, Final..."
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</label>
                            </div>
                            <textarea 
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent transition-all outline-none text-sm leading-relaxed"
                                value={newEvent.description}
                                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                                placeholder="Detalhes emocionantes sobre o evento..."
                            />
                        </div>
                    </form>
                </div>

                {/* Modal Footer - Fixed at bottom */}
                <div className="flex-shrink-0 p-6 border-t border-gray-100 bg-white rounded-b-2xl">
                    <button 
                        form="eventForm"
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-dark text-white py-4 rounded-xl hover:bg-pickle hover:text-brand-dark transition-all font-bold shadow-lg uppercase tracking-wider text-sm transform active:scale-[0.99]"
                    >
                        {loading ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Criar Evento Oficial')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL: Photo Upload Staging */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 font-display uppercase tracking-wide">
                        Upload de Fotos
                    </h3>
                    <p className="text-xs text-gray-500">{stagedFiles.length} fotos selecionadas</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setStagedFiles([]);
                            setIsUploadModalOpen(false);
                            setUploadEventId(null);
                        }}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 font-bold uppercase text-xs tracking-wider"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmUpload}
                        disabled={loading}
                        className="px-6 py-2 bg-pickle text-brand-dark rounded-lg hover:bg-pickle-400 font-bold uppercase text-xs tracking-wider shadow-md transition-all flex items-center"
                    >
                        {loading ? 'Enviando...' : 'Confirmar Envio'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {stagedFiles.map((draft, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                            <div className="relative h-48 bg-gray-100">
                                <img src={draft.preview} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeDraft(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md truncate max-w-[90%]">
                                    {draft.file.name.replace(/\.[^/.]+$/, "")}
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Legenda (Opcional)</label>
                                    <input 
                                        type="text" 
                                        value={draft.caption} 
                                        onChange={(e) => updateDraft(index, 'caption', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-pickle outline-none"
                                        placeholder="Final Mista..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tags (Separadas por vírgula)</label>
                                    <input 
                                        type="text" 
                                        value={draft.tags} 
                                        onChange={(e) => updateDraft(index, 'tags', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-pickle outline-none"
                                        placeholder="joao, maria, ouro"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};