import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, BookOpen, Calendar, PlusCircle, Trash2, Pencil, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [toastErro, setToastErro] = useState("");
  const [statsData, setStatsData] = useState({
    total_students: 0,
    total_courses: 0,
    total_classes: 0
  });

  const [cursos, setCursos] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novoCurso, setNovoCurso] = useState({
    name: '',
    category: '',
    duration: '',
    max_students: 30
  });

  const [categorias, setCategorias] = useState<string[]>([]);
  const [nomesSugeridos, setNomesSugeridos] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(cursos) && cursos.length > 0) {
      const catsUnicas = [...new Set(cursos.map((c: any) => c.category).filter(Boolean))];
      setCategorias(catsUnicas as string[]);
    } else {
      setCategorias([]);
    }
  }, [cursos]);

  useEffect(() => {
    if (!Array.isArray(cursos)) return;
    
    if (novoCurso.category) {
      const nomesFiltrados = cursos
        .filter((c: any) => c.category === novoCurso.category)
        .map((c: any) => c.name)
        .filter(Boolean);
      
      setNomesSugeridos([...new Set(nomesFiltrados)] as string[]);
    } else {
      const todosNomes = cursos.map((c: any) => c.name).filter(Boolean);
      setNomesSugeridos([...new Set(todosNomes)] as string[]);
    }
  }, [novoCurso.category, cursos]);

  const carregarCursos = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/courses`, {
        headers: { "Authorization": token || "" }
      });
      
      if (!response.ok) {
        console.error("Erro na API ao carregar cursos. Status:", response.status);
        setCursos([]);
        return;
      }

      const data = await response.json();
      
      // BLINDAGEM CRÍTICA
      if (Array.isArray(data)) {
        setCursos(data);
      } else {
        console.error("A API não retornou uma lista de cursos:", data);
        setCursos([]);
      }
    } catch (err) {
      console.error("Falha na requisição de cursos:", err);
      setCursos([]);
    }
  };

  // CORREÇÃO: Função buscarStats blindada com async/await
  const buscarStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stats`, {
        headers: { "Authorization": token || "" }
      });

      if (!response.ok) {
        console.error("Erro na API ao carregar estatísticas. Status:", response.status);
        return;
      }

      const data = await response.json();
      setStatsData(data);
    } catch (err) {
      console.error("Falha na requisição de stats:", err);
    }
  };

  useEffect(() => {
    carregarCursos();
    buscarStats();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const url = editandoId 
      ? `${import.meta.env.VITE_API_URL}/courses/${editandoId}` 
      : `${import.meta.env.VITE_API_URL}/courses`;
      
    const metodo = editandoId ? "PUT" : "POST";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify(novoCurso)
      });

      if (response.ok) {
        setNovoCurso({ name: '', category: '', duration: '', max_students: 30 });
        setEditandoId(null); 
        carregarCursos();
        buscarStats(); // Atualiza os números lá de cima também!
      } else {
        const errorData = await response.json();
        setToastErro(errorData.error || "Erro ao salvar curso");
        setTimeout(() => setToastErro(""), 5000);
      }
    } catch (err) {
      console.error("Erro na operação:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`, {
          method: "DELETE",
          headers: { "Authorization": token || "" }
        });

        if (response.ok) {
          carregarCursos();
          buscarStats(); // Atualiza os números após deletar
        } else {
          const errorData = await response.json();
          setToastErro(errorData.error || "Erro ao deletar");
          setTimeout(() => setToastErro(""), 5000);
        }
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  const preencherEdicao = (curso: any) => {
    setEditandoId(curso.ID);
    setNovoCurso({
      name: curso.name,
      category: curso.category,
      duration: curso.duration,
      max_students: curso.max_students
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    { label: 'Total de Alunos', value: statsData.total_students || 0, color: 'text-blue-600', bg: 'bg-blue-100', icon: Users },
    { label: 'Cursos Ativos', value: statsData.total_courses || 0, color: 'text-emerald-600', bg: 'bg-emerald-100', icon: BookOpen },
    { label: 'Turmas Ativas', value: statsData.total_classes || 0, color: 'text-amber-600', bg: 'bg-amber-100', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
          <p className="text-slate-500 mt-1">Gerencie os cursos e dados da instituição.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-emerald-500" /> {editandoId ? 'Editar Curso' : 'Novo Curso'}
          </h2>
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-5 gap-5">
            
            <div className="relative">
              <input 
                list="lista-categorias"
                type="text" 
                placeholder="Categoria (Escolha/Digite)" 
                className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={novoCurso.category} 
                onChange={(e) => setNovoCurso({...novoCurso, category: e.target.value})}
                required
              />
              <datalist id="lista-categorias">
                {categorias.map((cat: any) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="relative">
              <input 
                list="lista-nomes-cursos"
                type="text" 
                placeholder="Nome (Escolha/Digite)" 
                className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={novoCurso.name} 
                onChange={(e) => setNovoCurso({...novoCurso, name: e.target.value})} 
                required
              />
              <datalist id="lista-nomes-cursos">
                {nomesSugeridos.map((nome: any) => (
                  <option key={nome} value={nome} />
                ))}
              </datalist>
            </div>

            <input 
              type="text" placeholder="Duração (ex: 40h)" className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={novoCurso.duration} onChange={(e) => setNovoCurso({...novoCurso, duration: e.target.value})}
            />
            <input 
              type="number" placeholder="Máx. Alunos" className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={novoCurso.max_students} onChange={(e) => setNovoCurso({...novoCurso, max_students: Number(e.target.value)})}
              min="1"
            />
            <button type="submit" className={`${editandoId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-bold rounded-lg cursor-pointer transition-colors shadow-sm`}>
              {editandoId ? 'Atualizar Curso' : 'Salvar Curso'}
            </button>

            {editandoId && (
              <button 
                type="button" 
                onClick={() => {setEditandoId(null); setNovoCurso({name:'', category:'', duration:'', max_students: 30})}}
                className="col-span-5 md:col-span-1 text-slate-400 text-xs mt-[-10px] underline hover:text-slate-600 cursor-pointer"
              >
                Cancelar Edição
              </button>
            )}
          </form>
        </section>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-slate-900">
          <h2 className="text-xl font-bold mb-6">Cursos no Banco de Dados</h2>
          <div className="overflow-x-auto text-slate-900">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 font-semibold text-sm">ID</th>
                  <th className="py-4 font-semibold text-sm">Nome</th>
                  <th className="py-4 font-semibold text-sm">Categoria</th>
                  <th className="py-4 font-semibold text-sm">Duração</th>
                  <th className="py-4 font-semibold text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(cursos) && cursos.length > 0 ? (
                  cursos.map((curso: any) => (
                    <tr key={curso.ID} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-4 text-sm font-bold text-slate-400">#{curso.ID}</td>
                      <td className="py-4 text-sm font-medium text-slate-800">{curso.name}</td>
                      <td className="py-4 text-sm">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{curso.category}</span>
                      </td>
                      <td className="py-4 text-sm text-slate-600">{curso.duration}</td>
                      <td className="py-4 text-sm">
                        <button 
                          onClick={() => handleDelete(curso.ID)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Excluir curso"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={() => preencherEdicao(curso)} 
                          className="text-blue-400 hover:text-blue-600 transition-colors p-2 mr-2 cursor-pointer"
                          title="Editar curso"
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Nenhum curso encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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