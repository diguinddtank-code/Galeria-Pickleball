import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Trash2, Wand2, X, Image as ImageIcon, Check, Tag, User, Clock, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { generateEventDescription } from '../services/geminiService';
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

  // Form State - Advanced
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
  const [tagsInput, setTagsInput] = useState(''); // Temporary string for event tags

  const [generatingAI, setGeneratingAI] = useState(false);
  
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

  const handleGenerateDescription = async () => {
    if (!newEvent.title || !newEvent.location) {
      alert('Preencha o nome do evento e local antes de gerar a descrição.');
      return;
    }
    setGeneratingAI(true);
    const desc = await generateEventDescription(newEvent.title || '', `${newEvent.location} - Data: ${newEvent.date}`);
    setNewEvent(prev => ({ ...prev, description: desc }));
    setGeneratingAI(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.location) return;

    setLoading(true);
    
    // Process tags
    const processedTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    const eventToCreate = {
        title: newEvent.title,
        date: newEvent.date,
        location: newEvent.location,
        description: newEvent.description || '',
        organizer: newEvent.organizer || 'PickleballBH',
        category: newEvent.category || 'Geral',
        status: newEvent.status || 'completed',
        tags: processedTags,
        coverImage: newEvent.coverImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(newEvent.title)}&background=CCFF00&color=0f172a&size=800`
    };

    await dataService.createEvent(eventToCreate);
    await loadDashboard();
    
    setLoading(false);
    setIsModalOpen(false);
    setNewEvent({ title: '', date: '', location: '', description: '', coverImage: '', organizer: '', category: '', status: 'completed' });
    setTagsInput('');
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
        await dataService.deleteEvent(id);
        await loadDashboard();
    }
  };

  // --- Photo Upload Logic ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !uploadEventId) return;
    
    const files = Array.from(e.target.files);
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display uppercase tracking-wide">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Gerenciamento de Eventos e Mídia</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 md:mt-0 bg-pickle text-brand-dark px-6 py-2.5 rounded-full flex items-center hover:bg-pickle-400 transition-all shadow-lg hover:shadow-xl font-bold uppercase text-xs tracking-wider"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Evento
                </button>
            </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-pickle-600" />
                    Atividade Recente
                </h3>
            </div>
            <AdminChart events={events} />
        </div>

        {/* Events List */}
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-gray-800">Todos os Eventos</h3>
             <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-md">{events.length} Total</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading && events.length === 0 ? (
                 <div className="p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-pickle border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Sincronizando com Firebase...</p>
                 </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {events.map(event => (
                        <li key={event.id} className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-start space-x-5">
                                    <div className="relative">
                                        <img 
                                            src={event.coverImage} 
                                            alt="thumb" 
                                            className="w-20 h-20 rounded-xl object-cover bg-gray-200 shadow-sm border border-gray-100"
                                        />
                                        <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${event.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-800'}`}>
                                            {event.status === 'live' ? 'Ao Vivo' : 'Finalizado'}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 font-display uppercase tracking-tight">{event.title}</h4>
                                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                                            <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                                            <span>•</span>
                                            <span>{event.location}</span>
                                            <span>•</span>
                                            <span className="text-pickle-700 font-medium">{event.category}</span>
                                        </div>
                                        <div className="flex items-center mt-3 gap-2">
                                             <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                <ImageIcon className="w-3 h-3 mr-1.5" />
                                                {event.totalPhotos || 0} fotos
                                            </div>
                                            {event.organizer && (
                                                <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                    <User className="w-3 h-3 mr-1.5" />
                                                    {event.organizer}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button 
                                        onClick={() => {
                                            setUploadEventId(event.id);
                                            fileInputRef.current?.click();
                                        }}
                                        disabled={loading}
                                        className="flex-1 md:flex-none items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-pickle hover:text-brand-dark transition-all text-sm font-bold shadow-sm flex gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Fotos
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
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
                <div className="py-16 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhum evento criado.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-pickle-600 font-bold text-sm mt-2 hover:underline">Começar agora</button>
                </div>
            )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        multiple 
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* MODAL: Create Event (Enhanced) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] my-8">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 font-display uppercase tracking-wide">Novo Evento</h3>
                        <p className="text-xs text-gray-500">Preencha os detalhes do campeonato</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleCreateEvent} className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoria</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none"
                                value={newEvent.category}
                                onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                                placeholder="Ex: Open / 50+"
                            />
                        </div>
                        <div className="md:col-span-2">
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
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags do Evento</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none"
                                value={tagsInput}
                                onChange={e => setTagsInput(e.target.value)}
                                placeholder="Separe por vírgula: final, ouro, ..."
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">URL da Capa</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent focus:bg-white transition-all outline-none font-mono text-sm"
                            value={newEvent.coverImage}
                            onChange={e => setNewEvent({...newEvent, coverImage: e.target.value})}
                            placeholder="https://..."
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Deixe em branco para gerar capa automática.</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição Inteligente</label>
                            <button 
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={generatingAI}
                                className="text-xs flex items-center text-pickle-700 bg-pickle-100 hover:bg-pickle-200 px-3 py-1.5 rounded-full font-bold transition-colors"
                            >
                                <Wand2 className={`w-3 h-3 mr-1.5 ${generatingAI ? 'animate-spin' : ''}`} />
                                {generatingAI ? 'Criando...' : 'Gerar com IA'}
                            </button>
                        </div>
                        <textarea 
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pickle focus:border-transparent transition-all outline-none text-sm leading-relaxed"
                            value={newEvent.description}
                            onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                            placeholder="Detalhes emocionantes sobre o evento..."
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-brand-dark text-white py-4 rounded-xl hover:bg-pickle hover:text-brand-dark transition-all font-bold shadow-lg uppercase tracking-wider text-sm transform active:scale-[0.99]"
                        >
                            {loading ? 'Salvando...' : 'Criar Evento Oficial'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL: Photo Upload Staging (New Feature) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 font-display uppercase">Upload de Fotos</h2>
                    <p className="text-sm text-gray-500">{stagedFiles.length} fotos selecionadas para envio</p>
                </div>
                <div className="flex gap-4">
                     <button 
                        onClick={() => {
                            setStagedFiles([]); 
                            setIsUploadModalOpen(false);
                            setUploadEventId(null);
                        }}
                        className="px-6 py-2 text-gray-500 font-bold hover:text-red-500 transition-colors"
                     >
                        Cancelar
                     </button>
                     <button 
                        onClick={confirmUpload}
                        disabled={loading}
                        className="bg-pickle text-brand-dark px-8 py-2 rounded-full font-bold uppercase tracking-wider shadow-lg hover:bg-pickle-400 transition-all flex items-center"
                     >
                        {loading ? (
                            <>Enviando <span className="animate-spin ml-2">⏳</span></>
                        ) : (
                            <>Confirmar Upload <Check className="ml-2 w-4 h-4" /></>
                        )}
                     </button>
                </div>
            </div>

            {/* Staging Grid */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stagedFiles.map((draft, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all">
                                <div className="relative aspect-[4/3] bg-gray-100">
                                    <img src={draft.preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => removeDraft(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Legenda</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-pickle outline-none"
                                            placeholder="Ex: Final Masculina"
                                            value={draft.caption}
                                            onChange={(e) => updateDraft(index, 'caption', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center">
                                            <Tag className="w-3 h-3 mr-1" /> Tags
                                        </label>
                                        <input 
                                            type="text" 
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-pickle outline-none"
                                            placeholder="João, Maria, Ouro..."
                                            value={draft.tags}
                                            onChange={(e) => updateDraft(index, 'tags', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};