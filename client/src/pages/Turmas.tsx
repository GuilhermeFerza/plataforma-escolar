import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { PlusCircle, Trash2, Pencil, AlertCircle } from 'lucide-react';

export default function Turmas() {
  const [toastErro, setToastErro] = useState("");
  const [turmas, setTurmas] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null); 
  const [novaTurma, setNovaTurma] = useState<{name: string, subject_id: number | string}>({
    name: '',
    subject_id: ''
  });








  const carregarTurmas = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!token) return;

    try {
      const [resTurmas, resMaterias] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/classes`, { headers: { "Authorization": token } }),
        fetch(`${import.meta.env.VITE_API_URL}/subjects`, { headers: { "Authorization": token } })
      ]);

      if (!resTurmas.ok || !resMaterias.ok) {
        console.error("Erro ao buscar dados na API.");
        return;
      }

      let turmasData = await resTurmas.json();
      let materiasData = await resMaterias.json();

      if (!Array.isArray(turmasData)) turmasData = [];
      if (!Array.isArray(materiasData)) materiasData = [];

      if (user?.role !== "admin") {
        let cursosPermitidos: string[] = [];
        if (user?.curso) {
          try { cursosPermitidos = JSON.parse(user.curso); } 
          catch (e) { cursosPermitidos = [user.curso]; }
        }
        materiasData = materiasData.filter((m: any) => m.course?.name && cursosPermitidos.includes(m.course?.name));
        turmasData = turmasData.filter((t: any) => {
          if (!t.subject) return false;
          return t.subject.course?.name && cursosPermitidos.includes(t.subject.course.name);
        });
      }

      setTurmas(turmasData);
      setMaterias(materiasData);
    } catch (err) {
      console.error("Erro catastrófico ao carregar dados:", err);
    }
  };

  useEffect(() => { carregarTurmas(); }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();



    if (!novaTurma.subject_id || novaTurma.subject_id === ""){
      setToastErro("Selecione uma materia antes de criar a turma!")
      setTimeout(() => setToastErro(""), 4000);
      return;
    }

    const url = editandoId
      ? `${import.meta.env.VITE_API_URL}/classes/${editandoId}`
      : `${import.meta.env.VITE_API_URL}/classes`;
    
    const metodo = editandoId ? "PUT" : "POST"
    const token = localStorage.getItem("token");

    const payload = {
      name: novaTurma.name,
      subject_id: parseInt(novaTurma.subject_id as string, 10)
    };

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNovaTurma({ name: '', subject_id: '' });
        setEditandoId(null);
        carregarTurmas();
      } else {
        const errorData = await response.json();
        setToastErro(errorData.error || "Erro ao salvar turma");
        setTimeout(() => setToastErro(""), 5000);
      }
    } catch (err) { console.error("Erro ao salvar turma:", err); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/classes/${id}`, {
          method: "DELETE",
          headers: { "Authorization": token || "" }
        });
        if (response.ok) { carregarTurmas(); } 
        else {
          const errorData = await response.json();
          setToastErro(errorData.error);
          setTimeout(() => setToastErro(""), 5000);
        }
      } catch (err) { console.error("Erro ao deletar:", err); }
    }
  };

  const preencherEdicao = (turma: any) => {
    setEditandoId(turma.ID);
    setNovaTurma({
      name: turma.name,
      subject_id: turma.subject_id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Turmas</h1>
          <p className="text-slate-500 mt-1">Crie turmas e vincule-as às matérias existentes.</p>
        </header>

        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-500" /> 
            {editandoId ? 'Editar Turma' : 'Nova Turma'}
          </h2>
          <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" placeholder="Nome da Turma (Ex: Turma B)" 
              className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={novaTurma.name}
              onChange={(e) => setNovaTurma({...novaTurma, name: e.target.value})}
              required
            />
            
            <select 
              className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={novaTurma.subject_id}
              onChange={(e) => setNovaTurma({...novaTurma, subject_id: Number(e.target.value)})}
              required
            >
              <option value="">Selecione uma Matéria</option>
              {materias.map((materia: any) => (
                <option key={materia.ID} value={materia.ID}>{materia.name}</option>
              ))}
            </select>

            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 transition-all cursor-pointer">
              {editandoId ? 'Salvar Alterações' : 'Criar Turma'}
            </button>
            
            {editandoId && (
              <button 
                type="button" 
                onClick={() => { setEditandoId(null); setNovaTurma({name: '', subject_id: ''}); }}
                className="text-slate-500 text-sm underline"
              >
                Cancelar
              </button>
            )}
          </form>
        </section>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="py-4 font-semibold">Turma</th>
                <th className="py-4 font-semibold">Matéria Vinculada</th>
                <th className="py-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma: any) => (
                <tr key={turma.ID} className="border-b border-slate-50 text-slate-800 hover:bg-slate-50">
                  <td className="py-4 text-sm font-bold">{turma.name}</td>
                  <td className="py-4 text-sm">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                      {turma.subject?.name || "Sem matéria"}
                    </span>
                  </td>
                  <td className="py-4 text-sm flex gap-2">
                      <button onClick={() => handleDelete(turma.ID)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                      <button onClick={() => preencherEdicao(turma)} className="text-blue-500 hover:text-blue-700 p-1"><Pencil size={18} /></button>
                    </td>
                </tr>
              ))}
              {turmas.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-slate-400 text-sm">Nenhuma turma encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      {toastErro && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300 z-50 max-w-md">
          <AlertCircle size={24} className="shrink-0" />
          <span className="font-semibold text-sm">{toastErro}</span>
        </div>
      )}
    </div>
  );
}