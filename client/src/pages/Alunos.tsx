import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

export default function Alunos() {
  
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
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

    try {
      const [resAlunos, resTurmas] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/students`, { headers: { "Authorization": token || "" } }),
        fetch(`${import.meta.env.VITE_API_URL}/classes`, { headers: { "Authorization": token || "" } })
      ]);

      let alunosData = await resAlunos.json();
      let turmasData = await resTurmas.json();

      // O FILTRO DE ACESSO:
      if (user?.role !== "admin") {
        // 1. Filtra as turmas para o Dropdown
        turmasData = turmasData.filter((t: any) => t.course?.name === user?.curso);
        
        // 2. Extrai os IDs das turmas permitidas
        const turmasIdsPermitidas = turmasData.map((t: any) => t.ID);
        
        // 3. Filtra a lista de alunos para mostrar apenas os que estão nessas turmas
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

  try{
    const response = await fetch(url, {
      method: metodo,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": token || ""
      },
      body: JSON.stringify(novoAluno)
    });
    if (response.ok) {
      setNovoAluno({ name: '', email: '', cpf: '', class_id: '' });
      setEditandoId(null);
      carregarDados();
    }
  } catch (err){
    console.error("Erro ao salvar aluno:", err);
  }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este aluno?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/students/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": token || ""
          }
        });

        if (response.ok) {
          carregarDados();
        }
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  const [editandoId, setEditandoId] = useState(null);

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

        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-500" /> Nova Matrícula
          </h2>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input 
              type="text" placeholder="Nome Completo" className="p-2 border rounded-lg text-sm"
              value={novoAluno.name} onChange={(e) => setNovoAluno({...novoAluno, name: e.target.value})} required
            />
            <input 
              type="email" placeholder="E-mail" className="p-2 border rounded-lg text-sm"
              value={novoAluno.email} onChange={(e) => setNovoAluno({...novoAluno, email: e.target.value})} required
            />
            <input 
              type="text" placeholder="CPF" className="p-2 border rounded-lg text-sm"
              value={novoAluno.cpf} onChange={(e) => setNovoAluno({...novoAluno, cpf: e.target.value})} required
            />
            <select 
              className="p-2 border rounded-lg text-sm"
              value={novoAluno.class_id} onChange={(e) => setNovoAluno({...novoAluno, class_id: Number(e.target.value)})} required
            >
              <option value="">Selecione a Turma</option>
              {turmas.map(t => (
                <option key={t.ID} value={t.ID}>{t.name} ({t.course?.name})</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 transition-all cursor-pointer">
              {editandoId ? 'Salvar Alterações' : 'Matricular'}
            </button>
            
            {editandoId && (
              <button 
                type="button" 
                onClick={() => { setEditandoId(null); setNovoAluno({name: '', email: '', cpf: '', class_id: ''}); }}
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
                <th className="py-4 font-semibold">Aluno</th>
                <th className="py-4 font-semibold">CPF</th>
                <th className="py-4 font-semibold">Turma / Curso</th>
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
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">{aluno.class?.name}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{aluno.class?.course?.name}</span>
                    </div>
                  </td>
                   <td className="py-4 text-sm flex gap-2">
                      <button 
                        onClick={() => handleDelete(aluno.ID)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Excluir aluno"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => preencherEdicao(aluno)} 
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Editar aluno"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}