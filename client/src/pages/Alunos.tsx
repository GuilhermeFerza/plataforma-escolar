import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Pencil, Trash2, UserPlus, AlertCircle } from 'lucide-react';

export default function Alunos() {
  const [toastErro, setToastErro] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novoAluno, setNovoAluno] = useState<{name: string, email: string, cpf: string, class_id: string | number}>({
    name: '',
    email: '',
    cpf: '',
    class_id: ''
  });

  const carregarDados = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    
    // Atualiza estado de Admin
    if (user) { setIsAdmin(user.role === "admin"); }

    try {
      const [resAlunos, resTurmas] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/students`, { headers: { "Authorization": token || "" } }),
        fetch(`${import.meta.env.VITE_API_URL}/classes`, { headers: { "Authorization": token || "" } })
      ]);

      let alunosData = await resAlunos.json();
      let turmasData = await resTurmas.json();

      if (!Array.isArray(alunosData)) alunosData = [];
      if (!Array.isArray(turmasData)) turmasData = [];

      if (user?.role !== "admin") {
        let cursosPermitido: string[] = [];
        if (user?.curso){
          try{ cursosPermitido = JSON.parse(user.curso); }
          catch(e){ cursosPermitido = [user.curso]; }
        }

        turmasData = turmasData.filter((t: any) => t.subject?.course?.name && cursosPermitido.includes(t.subject.course.name));
        const turmasIdsPermitidas = turmasData.map((t: any) => t.ID);
        alunosData = alunosData.filter((a: any) => turmasIdsPermitidas.includes(a.class_id));
      }

      setAlunos(alunosData);
      setTurmas(turmasData);
    } catch (err) {
      console.error("Erro ao carregar dados da secretaria:", err);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editandoId
      ? `${import.meta.env.VITE_API_URL}/students/${editandoId}`
      : `${import.meta.env.VITE_API_URL}/students`;

    const metodo = editandoId ? "PUT" : "POST"
    const token = localStorage.getItem("token");

    const payload = { ...novoAluno, class_id: Number(novoAluno.class_id) };

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
        setNovoAluno({ name: '', email: '', cpf: '', class_id: '' });
        setEditandoId(null);
        carregarDados();
      } else {
        const errorData = await response.json();
        setToastErro(errorData.error || "Erro ao salvar aluno.");
        setTimeout(() => setToastErro(""), 5000);
      }
    } catch (err) {
      console.error("Erro ao salvar aluno:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${id}`, {
          method: "DELETE",
          headers: { "Authorization": token || "" }
        });

        if (response.ok) { carregarDados(); }
      } catch (err) { console.error("Erro ao deletar:", err); }
    }
  };

  const preencherEdicao = (aluno: any) => {
    setEditandoId(aluno.ID);
    setNovoAluno({
      name: aluno.name,
      email: aluno.email,
      cpf: aluno.cpf,
      class_id: aluno.class_id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Secretaria Acadêmica</h1>
          <p className="text-slate-500 mt-1">Matrícula e gestão de alunos.</p>
        </header>

        {isAdmin && (
          <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-indigo-500" /> 
              {editandoId ? 'Editar Aluno' : 'Nova Matrícula'}
            </h2>
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input 
                type="text" placeholder="Nome Completo" className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={novoAluno.name} onChange={(e) => setNovoAluno({...novoAluno, name: e.target.value})} required
              />
              <input 
                type="email" placeholder="E-mail" className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={novoAluno.email} onChange={(e) => setNovoAluno({...novoAluno, email: e.target.value})} required
              />
              <input 
                type="text" placeholder="CPF" className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={novoAluno.cpf} onChange={(e) => setNovoAluno({...novoAluno, cpf: e.target.value})} required
              />
              <select 
                className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={novoAluno.class_id} onChange={(e) => setNovoAluno({...novoAluno, class_id: Number(e.target.value)})} required
              >
                <option value="" disabled>Selecione a Turma</option>
                {turmas.map(t => (
                  <option key={t.ID} value={t.ID}>{t.name} ({t.subject?.name || 'Sem Curso'})</option>
                ))}
              </select>
              <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 font-bold hover:bg-indigo-700 transition-all cursor-pointer">
                {editandoId ? 'Salvar' : 'Matricular'}
              </button>
              
              {editandoId && (
                <button 
                  type="button" 
                  onClick={() => { setEditandoId(null); setNovoAluno({name: '', email: '', cpf: '', class_id: ''}); }}
                  className="col-span-5 md:col-span-1 text-slate-500 text-xs mt-[-10px] underline hover:text-slate-600"
                >
                  Cancelar Edição
                </button>
              )}
            </form>
          </section>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="py-4 font-semibold">Aluno</th>
                <th className="py-4 font-semibold">CPF</th>
                <th className="py-4 font-semibold">Turma / Curso</th>
                {isAdmin && <th className="py-4 font-semibold">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.ID} className="border-b border-slate-50">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{aluno.name}</span>
                      <span className="text-xs text-slate-400">{aluno.email}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-600">{aluno.cpf}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">
                        {aluno.class?.name || "Sem Turma"}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                        {aluno.class?.subject?.name || "Sem Curso"}
                      </span>
                    </div>
                  </td>
                  
                  {isAdmin && (
                    <td className="py-4 text-sm flex gap-2">
                      <button 
                        onClick={() => handleDelete(aluno.ID)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => preencherEdicao(aluno)} 
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {alunos.length === 0 && (
                 <tr><td colSpan={isAdmin ? 4 : 3} className="py-8 text-center text-slate-400 text-sm">Nenhum aluno matriculado.</td></tr>
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