import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, BookOpen, Calendar, PlusCircle, Trash2, Pencil } from 'lucide-react';

export default function Dashboard() {
  const [statsData, setStatsData] = useState({
    total_students: 0,
    total_courses: 0,
    total_classes: 0
  });
  const [cursos, setCursos] = useState([]);
  const [novoCurso, setNovoCurso] = useState({
    name: '',
    category: '',
    duration: '',
    max_students: 30
  });

  const carregarCursos = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8081/api/courses", {
      headers: {
        "Authorization": token
      }
    })
      .then(response => response.json())
      .then(data => setCursos(data))
      .catch(err => console.error("Erro ao carregar:", err));
  };

  useEffect(() => {
    carregarCursos();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
  
    const url = editandoId 
      ? `http://localhost:8081/api/courses/${editandoId}` 
      : "http://localhost:8081/api/courses";
      
    const metodo = editandoId ? "PUT" : "POST";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(novoCurso)
      });

      if (response.ok) {
        setNovoCurso({ name: '', category: '', duration: '', max_students: 30 });
        setEditandoId(null); 
        carregarCursos();
      } else {
        console.error("Não autorizado ou erro no servidor");
      }
    } catch (err) {
      console.error("Erro na operação:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:8081/api/courses/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": token
          }
        });

        if (response.ok) {
          carregarCursos();
        }
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  const [editandoId, setEditandoId] = useState(null);

  const preencherEdicao = (curso) => {
    setEditandoId(curso.ID);
    setNovoCurso({
      name: curso.name,
      category: curso.category,
      duration: curso.duration,
      max_students: curso.max_students
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8081/api/stats", {
      headers: {
        "Authorization": token
      }
    })
      .then(res => res.json())
      .then(data => setStatsData(data))
      .catch(err => console.error("Erro ao buscar stats:", err));
  }, []);

  const stats = [
    { label: 'Total de Alunos', value: statsData.total_students, color: 'text-blue-600', bg: 'bg-blue-100', icon: Users },
    { label: 'Cursos Ativos', value: statsData.total_courses, color: 'text-emerald-600', bg: 'bg-emerald-100', icon: BookOpen },
    { label: 'Turmas Ativas', value: statsData.total_classes, color: 'text-amber-600', bg: 'bg-amber-100', icon: Calendar },
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
            <PlusCircle size={20} className="text-emerald-500" /> Novo Curso
          </h2>
          <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <input 
              type="text" placeholder="Nome do Curso" className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={novoCurso.name} onChange={(e) => setNovoCurso({...novoCurso, name: e.target.value})} required
            />
            <input 
              type="text" placeholder="Categoria" className="p-2 border rounded-lg text-sm"
              value={novoCurso.category} onChange={(e) => setNovoCurso({...novoCurso, category: e.target.value})}
            />
            <input 
              type="text" placeholder="Duração (ex: 40h)" className="p-2 border rounded-lg text-sm"
              value={novoCurso.duration} onChange={(e) => setNovoCurso({...novoCurso, duration: e.target.value})}
            />
            <input 
              type="number" placeholder="Máximo de Alunos" className="p-2 border rounded-lg text-sm"
              value={novoCurso.max_students} onChange={(e) => setNovoCurso({...novoCurso, max_students: Number(e.target.value)})}
            />
            <button type="submit" className={`${editandoId ? 'bg-blue-500' : 'bg-emerald-500'} text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}>
              {editandoId ? 'Atualizar Curso' : 'Salvar Curso'}
            </button>

            {editandoId && (
              <button 
                type="button" 
                onClick={() => {setEditandoId(null); setNovoCurso({name:'', category:'', duration:'', max_students: 0})}}
                className="text-slate-400 text-xs mt-2 underline"
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
                {cursos && cursos.length > 0 ? (
                  cursos.map((curso) => (
                    <tr key={curso.ID} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-4 text-sm font-bold">#{curso.ID}</td>
                      <td className="py-4 text-sm">{curso.name}</td>
                      <td className="py-4 text-sm">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">{curso.category}</span>
                      </td>
                      <td className="py-4 text-sm">{curso.duration}</td>
                      <td className="py-4 text-sm">
                        <button 
                          onClick={() => handleDelete(curso.ID)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="Excluir curso"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          onClick={() => preencherEdicao(curso)} 
                          className="text-blue-500 hover:text-blue-700 p-2 mr-2"
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-500">Nenhum curso encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}