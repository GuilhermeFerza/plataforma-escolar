import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { BookMarked, PlusCircle, Trash2, Pencil, AlertCircle } from 'lucide-react';

export default function Materias() {
  const [toastErro, setToastErro] = useState("");
  const [materias, setMaterias] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null); 
  const [novaMateria, setNovaMateria] = useState<{name: string, description: string, workload: string, course_id: number | string}>({
    name: '',
    description: '',
    workload: '',
    course_id: ''
  });

  const carregarDados = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    try {
      const [resMaterias, resCursos] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/subjects`, { headers: { "Authorization": token || "" } }),
        fetch(`${import.meta.env.VITE_API_URL}/courses`, { headers: { "Authorization": token || "" } })
      ]);

      let materiasData = await resMaterias.json();
      let cursosData = await resCursos.json();

      if (user?.role !== "admin") {
        let cursosPermitido: string[] = [];
        if (user?.course){ 
          try{
            cursosPermitido = JSON.parse(user.course); 
          }catch(e){
            cursosPermitido = [user.course]; 
          }
        }
        cursosData = cursosData.filter((c: any) => cursosPermitido.includes(c.name));
        materiasData = materiasData.filter((m: any) => cursosPermitido.includes(m.course?.name));
      }

      setMaterias(materiasData);
      setCursos(cursosData);
    } catch (err) {
      console.error("Erro ao carregar matérias:", err);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleAddMateria = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editandoId
      ? `${import.meta.env.VITE_API_URL}/subjects/${editandoId}`
      : `${import.meta.env.VITE_API_URL}/subjects`;
    
    const metodo = editandoId ? "PUT" : "POST"
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({...novaMateria, course_id: Number(novaMateria.course_id)})
      });

      if (response.ok) {
        setNovaMateria({ name: '', description: '', workload: '', course_id: '' });
        setEditandoId(null);
        carregarDados();
      } else {
        const errorData = await response.json();
        setToastErro(errorData.error || "Erro ao salvar matéria");
        setTimeout(() => setToastErro(""), 5000);
      }
    } catch (err) {
      console.error("Erro ao salvar matéria:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta matéria?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/subjects/${id}`, {
          method: "DELETE",
          headers: { "Authorization": token || "" }
        });

        if (response.ok) {
          carregarDados();
        } else {
          const errorData = await response.json();
          setToastErro(errorData.error);
          setTimeout(() => setToastErro(""), 5000);
        }
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  const preencherEdicao = (materia: any) => {
    setEditandoId(materia.ID);
    setNovaMateria({
      name: materia.name,
      description: materia.description,
      workload: materia.workload,
      course_id: materia.course_id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Matérias</h1>
          <p className="text-slate-500 mt-1">Cadastre as disciplinas que compõem os cursos.</p>
        </header>

        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-cyan-500" /> 
            {editandoId ? 'Editar Matéria' : 'Nova Matéria'}
          </h2>
          <form onSubmit={handleAddMateria} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input 
              type="text" placeholder="Nome (Ex: Lógica de Programação)" 
              className="col-span-2 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              value={novaMateria.name} onChange={(e) => setNovaMateria({...novaMateria, name: e.target.value})} required
            />
            
            <input 
              type="text" placeholder="Carga Horária (Ex: 80h)" 
              className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              value={novaMateria.workload} onChange={(e) => setNovaMateria({...novaMateria, workload: e.target.value})} required
            />

            <select 
              className="col-span-2 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              value={novaMateria.course_id} onChange={(e) => setNovaMateria({...novaMateria, course_id: Number(e.target.value)})} required
            >
              <option value="">Selecione um Curso</option>
              {cursos.map((curso: any) => (
                <option key={curso.ID} value={curso.ID}>{curso.name}</option>
              ))}
            </select>

            <input 
              type="text" placeholder="Descrição rápida sobre a matéria..." 
              className="col-span-4 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              value={novaMateria.description} onChange={(e) => setNovaMateria({...novaMateria, description: e.target.value})}
            />

            <button type="submit" className="bg-cyan-600 text-white rounded-lg py-2 font-bold hover:bg-cyan-700 transition-all cursor-pointer">
              {editandoId ? 'Salvar' : 'Cadastrar'}
            </button>
            
            {editandoId && (
              <button 
                type="button" 
                onClick={() => { setEditandoId(null); setNovaMateria({name: '', description: '', workload: '', course_id: ''}); }}
                className="col-span-5 text-slate-500 text-sm underline text-right"
              >
                Cancelar Edição
              </button>
            )}
          </form>
        </section>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="py-4 font-semibold">Disciplina</th>
                <th className="py-4 font-semibold">Carga Horária</th>
                <th className="py-4 font-semibold">Curso Vinculado</th>
                <th className="py-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((materia: any) => (
                <tr key={materia.ID} className="border-b border-slate-50 text-slate-800 hover:bg-slate-50">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm flex items-center gap-2"><BookMarked size={14} className="text-cyan-500"/>{materia.name}</span>
                      <span className="text-xs text-slate-400 mt-1">{materia.description}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-slate-600">{materia.workload}</td>
                  <td className="py-4 text-sm">
                    <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold">
                      {materia.course?.name || "Sem curso"}
                    </span>
                  </td>
                  <td className="py-4 text-sm flex gap-2">
                      <button onClick={() => handleDelete(materia.ID)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                      <button onClick={() => preencherEdicao(materia)} className="text-blue-500 hover:text-blue-700 p-1"><Pencil size={18} /></button>
                    </td>
                </tr>
              ))}
              {materias.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">Nenhuma matéria encontrada.</td></tr>
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