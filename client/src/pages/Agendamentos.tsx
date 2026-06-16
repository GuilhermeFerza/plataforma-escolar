import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Calendar as CalendarIcon, Clock, PlusCircle, Trash2, Tag, School } from 'lucide-react';

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  
  const [novoAgendamento, setNovoAgendamento] = useState({
    title: '',
    description: '',
    date: '',
    type: 'Evento',
    class_id: '',
    creator_name: ''
  });

  const carregarDados = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { "Authorization": token };

    fetch(`${import.meta.env.VITE_API_URL}/appointments`, { headers })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (Array.isArray(data)) setAgendamentos(data);
      })
      .catch(err => console.error("Erro ao carregar agendamentos:", err));

    fetch(`${import.meta.env.VITE_API_URL}/classes`, { headers })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (Array.isArray(data)) setTurmas(data);
      })
      .catch(err => console.error("Erro ao carregar turmas:", err));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    let userId = 0;
    let userName = "";
    if (userString) {
        const userObj = JSON.parse(userString);
        userId = userObj.id;
        userName = userObj.name
    }

    const payload = {
      title: novoAgendamento.title,
      description: novoAgendamento.description,
      type: novoAgendamento.type,
      date: new Date(novoAgendamento.date).toISOString(), 
      class_id: novoAgendamento.class_id ? Number(novoAgendamento.class_id) : null,
      creator_id: userId,
      creator_name: userName
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNovoAgendamento({ title: '', description: '', date: '', type: 'Evento', class_id: '', creator_name: '' });
        carregarDados();
      } else {
        alert("Erro ao salvar o agendamento.");
      }
    } catch (err) {
      console.error("Erro na operação:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${id}`, {
          method: "DELETE",
          headers: { "Authorization": token || "" }
        });

        if (response.ok) {
          carregarDados();
        }
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(data);
  };

  const tiposEvento = ['Evento', 'Prova', 'Reunião', 'Feriado'];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Calendário e Eventos</h1>
          <p className="text-slate-500 mt-1">Gerencie provas, reuniões e comunicados gerais.</p>
        </header>

        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-purple-500" /> Novo Agendamento
          </h2>
          <form onSubmit={handleAddAppointment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="col-span-1 lg:col-span-2">
              <input 
                type="text" placeholder="Título do Evento (Ex: Prova Final)" 
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                value={novoAgendamento.title} onChange={(e) => setNovoAgendamento({...novoAgendamento, title: e.target.value})} required
              />
            </div>

            <div className="flex items-center gap-2 border rounded-lg px-2 focus-within:ring-2 focus-within:ring-purple-500 bg-white">
              <Clock size={18} className="text-slate-400" />
              <input 
                type="datetime-local" 
                className="w-full py-2.5 text-sm outline-none bg-transparent text-slate-700"
                value={novoAgendamento.date} onChange={(e) => setNovoAgendamento({...novoAgendamento, date: e.target.value})} required
              />
            </div>

            <div className="flex items-center gap-2 border rounded-lg px-2 focus-within:ring-2 focus-within:ring-purple-500 bg-white">
              <Tag size={18} className="text-slate-400" />
              <select 
                className="w-full py-2.5 text-sm outline-none bg-transparent"
                value={novoAgendamento.type} onChange={(e) => setNovoAgendamento({...novoAgendamento, type: e.target.value})} required
              >
                {tiposEvento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>

            <div className="col-span-1 lg:col-span-3 flex items-center gap-2 border rounded-lg px-2 focus-within:ring-2 focus-within:ring-purple-500 bg-white">
              <School size={18} className="text-slate-400" />
              <select 
                className="w-full py-2.5 text-sm outline-none bg-transparent"
                value={novoAgendamento.class_id} onChange={(e) => setNovoAgendamento({...novoAgendamento, class_id: e.target.value})}
              >
                <option value="">Geral (Todas as turmas)</option>
                {turmas.map((turma: any) => (
                  <option key={turma.ID} value={turma.ID}>Turma: {turma.name} da Materia: {turma.subject?.name || 'Sem Materia'}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="bg-purple-600 text-white rounded-lg py-2.5 font-bold hover:bg-purple-700 transition-all cursor-pointer">
              Agendar Evento
            </button>
          </form>
        </section>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="py-4 font-semibold">Data e Hora</th>
                <th className="py-4 font-semibold">Evento</th>
                <th className="py-4 font-semibold">Orador</th>
                <th className="py-4 font-semibold">Tipo</th>
                <th className="py-4 font-semibold">Público</th>
                <th className="py-4 font-semibold w-16">Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((agendamento: any) => (
                <tr key={agendamento.ID} className="border-b border-slate-50 text-slate-800 hover:bg-slate-50">
                  <td className="py-4 text-sm font-medium flex items-center gap-2">
                    <CalendarIcon size={16} className="text-purple-500" />
                    {formatarData(agendamento.date)}
                  </td>
                  <td className="py-4 text-sm font-bold">{agendamento.title}</td>
                  <td className="py-4 text-sm font-bold">{agendamento.creator_name}</td>
                  <td className="py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      agendamento.type === 'Prova' ? 'bg-red-50 text-red-600' : 
                      agendamento.type === 'Reunião' ? 'bg-blue-50 text-blue-600' : 
                      agendamento.type === 'Feriado' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {agendamento.type}
                    </span>
                  </td>
                  <td className="py-4 text-sm">
                    {agendamento.class ? (
                      <span className="text-slate-600">Turma {agendamento.class.name}</span>
                    ) : (
                      <span className="text-slate-400 font-medium">Escola Toda</span>
                    )}
                  </td>
                  <td className="py-4 text-sm">
                    <button onClick={() => handleDelete(agendamento.ID)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {agendamentos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">Nenhum evento agendado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}