import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mail, Lock, Hash, UserPlus, BookOpen, PlusCircle, LayoutGrid, X, Trash2, Pencil } from 'lucide-react';

export default function Admin(){
  const [funcionarios, setFuncionarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [editandoFuncionarioId, setEditandoFuncionarioId] = useState<number | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [cursoSelecionadoTemp, setCursoSelecionadoTemp] = useState("");
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [listaCursosPermitidos, setListaCursosPermitidos] = useState<string[]>([]);

  const [novoCurso, setNovoCurso] = useState({
    name: "",
    category: "",
    duration: "",
    max_students: ""
  });

  const [novoFuncionario, setNovoFuncionario] = useState({
    funcionario_id: "",
    name: "",
    email: "",
    password: ""
  });

  const carregarDados = async () => {
    const token = localStorage.getItem("token");
    const headers = { "Authorization": token || "" };

    try {
      const resFunc = await fetch("http://localhost:8081/api/users", { headers });
      if (resFunc.ok) setFuncionarios(await resFunc.json());
      
      const resCursos = await fetch("http://localhost:8081/api/courses", { headers });
      if (resCursos.ok){
        const dataCursos = await resCursos.json();
        setCursos(dataCursos);
        const categoriasUnicas = [...new Set(dataCursos.map((c: any) => c.category))];
        setCategorias(categoriasUnicas as string[]);
      }
    } catch(err){
      console.error("Erro ao carregar dados:", err);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  useEffect(()=>{
    if(categoriaSelecionada){
      const filtrados = cursos.filter((c: any) => c.category === categoriaSelecionada);
      setCursosFiltrados(filtrados);
    }else{
      setCursosFiltrados([]);
    }
    setCursoSelecionadoTemp("");
  }, [categoriaSelecionada, cursos]);

  const adicionarCursoNaLista = () => {
    if (cursoSelecionadoTemp && !listaCursosPermitidos.includes(cursoSelecionadoTemp)) {
      setListaCursosPermitidos([...listaCursosPermitidos, cursoSelecionadoTemp]);
      setCursoSelecionadoTemp("");
    }
  };

  const removerCursoDaLista = (cursoRemover: string) => {
    setListaCursosPermitidos(listaCursosPermitidos.filter(c => c !== cursoRemover));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8081/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({
          ...novoCurso,
          max_students: Number(novoCurso.max_students)
        })
      });

      if(response.ok){
        alert("Curso criado com sucesso!");
        setNovoCurso({ name: '', category: '', duration: '', max_students: ''})
        carregarDados();
      } else{
        alert("Erro ao criar curso.");
      }
    } catch(err){ console.error(err);}
  };

  const handleCreateFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (listaCursosPermitidos.length === 0) {
      alert("ATENÇÃO: Você precisa atribuir pelo menos UM curso ao funcionário.");
      return;
    }

    const url = editandoFuncionarioId 
      ? `http://localhost:8081/api/users/${editandoFuncionarioId}`
      : "http://localhost:8081/api/register";
    const method = editandoFuncionarioId ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token || ""
        },
        body: JSON.stringify({
          ...novoFuncionario,
          funcionario_id: Number(novoFuncionario.funcionario_id),
          curso: JSON.stringify(listaCursosPermitidos) 
        }) 
      });

      if (response.ok){
        alert(editandoFuncionarioId ? "Funcionário atualizado com sucesso!" : "Funcionário habilitado com sucesso!");
        setNovoFuncionario({ funcionario_id: '', name: '', email: '', password: ''});
        setCategoriaSelecionada("");
        setListaCursosPermitidos([]);
        setEditandoFuncionarioId(null);
        carregarDados();
      } else {
        try {
          const errorData = await response.json();
          alert(errorData.error);
        } catch {
          alert("Erro no servidor (A rota pode estar inacessível).");
        }
      }
    } catch(err){ console.error(err);}
  };

  const handleDeleteFuncionario = async (id: number) => {
    if (window.confirm("Tem certeza que deseja remover o acesso deste funcionário?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8081/api/users/${id}`, {
          method: "DELETE",
          headers: { "Authorization": token || "" }
        });
        
        if (response.ok) {
          carregarDados();
        } else {
          try {
            const err = await response.json();
            alert(err.error || err.message);
          } catch {
            alert("Erro interno no servidor ao tentar excluir.");
          }
        }
      } catch (err) { console.error(err); }
    }
  };
  const preencherEdicaoFuncionario = (func: any) => {
    setEditandoFuncionarioId(func.ID);
    setNovoFuncionario({
      funcionario_id: func.funcionario_id.toString(),
      name: func.name,
      email: func.email,
      password: ""
    });
  
    try {
      setListaCursosPermitidos(JSON.parse(func.curso));
    } catch {
      setListaCursosPermitidos([func.curso]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const renderCursosTabela = (cursoString: string) => {
    try {
      const cursosParsed = JSON.parse(cursoString);
      if (Array.isArray(cursosParsed)) {
        return cursosParsed.join(", ");
      }
      return cursoString;
    } catch {
      return cursoString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10 text-center">
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Painel de Controle</h1>
          <p className="text-slate-500 mt-1">Gerencie cursos, categorias e acessos de funcionários.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen size={24} className="text-emerald-500" /> Cadastrar Novo Curso
            </h2>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Nome do Curso</label>
                <input 
                  type="text" placeholder="Ex: Ciência da Computação" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={novoCurso.name} onChange={(e) => setNovoCurso({...novoCurso, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Categoria (Área)</label>
                <input 
                  type="text" placeholder="Ex: Tecnologia" required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={novoCurso.category} onChange={(e) => setNovoCurso({...novoCurso, category: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Duração</label>
                  <input 
                    type="text" placeholder="Ex: 8 Semestres" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={novoCurso.duration} onChange={(e) => setNovoCurso({...novoCurso, duration: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Alunos Máx.</label>
                  <input 
                    type="number" placeholder="Ex: 50" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={novoCurso.max_students} onChange={(e) => setNovoCurso({...novoCurso, max_students: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer">
                <PlusCircle size={20} /> Salvar Curso
              </button>
            </form>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus size={24} className="text-indigo-500" /> Cadastrar Funcionário
            </h2>

            <form onSubmit={handleCreateFuncionario} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-1"><Hash size={14}/> ID</label>
                  <input 
                    type="number" placeholder="1001" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={novoFuncionario.funcionario_id} onChange={(e) => setNovoFuncionario({...novoFuncionario, funcionario_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Nome</label>
                  <input 
                    type="text" placeholder="João Silva" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={novoFuncionario.name} onChange={(e) => setNovoFuncionario({...novoFuncionario, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-indigo-900 flex items-center gap-2"><LayoutGrid size={16}/> Categoria</label>
                    <select 
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      value={categoriaSelecionada} onChange={(e) => setCategoriaSelecionada(e.target.value)}
                    >
                      <option value="">Filtro...</option>
                      {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-indigo-900 flex items-center gap-2"><BookOpen size={16}/> Selecionar Curso</label>
                    <div className="flex gap-2">
                      <select 
                        className={`flex-1 p-2.5 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${!categoriaSelecionada ? 'opacity-50 cursor-not-allowed border-slate-200' : 'border-indigo-300'}`}
                        value={cursoSelecionadoTemp} onChange={(e) => setCursoSelecionadoTemp(e.target.value)}
                        disabled={!categoriaSelecionada}
                      >
                        <option value="">Cursos...</option>
                        {cursosFiltrados.map((c: any) => <option key={c.ID} value={c.name}>{c.name}</option>)}
                      </select>
                      <button 
                        type="button" onClick={adicionarCursoNaLista}
                        className="bg-indigo-600 text-white p-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                        disabled={!cursoSelecionadoTemp}
                      >
                        <PlusCircle size={20}/>
                      </button>
                    </div>
                  </div>
                </div>

                {listaCursosPermitidos.length > 0 && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg flex flex-wrap gap-2">
                    {listaCursosPermitidos.map(curso => (
                      <span key={curso} className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-indigo-200">
                        {curso}
                        <button type="button" onClick={() => removerCursoDaLista(curso)} className="text-indigo-400 hover:text-red-500 cursor-pointer">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {listaCursosPermitidos.length === 0 && (
                  <p className="text-xs text-red-500 font-semibold mt-2">* Selecione e adicione pelo menos um curso acima.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-1"><Mail size={14}/> E-mail</label>
                  <input 
                    type="email" placeholder="func@email.com" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={novoFuncionario.email} onChange={(e) => setNovoFuncionario({...novoFuncionario, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 flex items-center gap-1"><Lock size={14}/> Senha</label>
                  <input 
                    type="password" placeholder="••••••••" required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={novoFuncionario.password} onChange={(e) => setNovoFuncionario({...novoFuncionario, password: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className={`w-full text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer ${editandoFuncionarioId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                 <UserPlus size={20} /> {editandoFuncionarioId ? "Salvar Alterações" : "Ativar Acesso"}
              </button>

              {editandoFuncionarioId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditandoFuncionarioId(null); 
                    setNovoFuncionario({funcionario_id: '', name: '', email: '', password: ''});
                    setListaCursosPermitidos([]);
                    setCategoriaSelecionada("");
                  }}
                  className="w-full text-slate-400 text-xs mt-2 underline hover:text-slate-600 cursor-pointer text-center block"
                >
                  Cancelar Edição
                </button>
              )}
            </form>
          </section>
        </div>

        <div className="w-full mt-12 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nome do Funcionário</th>
                <th className="px-6 py-4 font-semibold">E-mail</th>
                <th className="px-6 py-4 font-semibold max-w-[300px]">Cursos Atribuídos</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((funcionario: any) => (
                <tr key={funcionario.ID} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-400">#{funcionario.funcionario_id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{funcionario.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{funcionario.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[300px]" title={renderCursosTabela(funcionario.curso)}>
                    {renderCursosTabela(funcionario.curso)}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button onClick={() => handleDeleteFuncionario(funcionario.ID)} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Excluir">
                      <Trash2 size={18} />
                    </button>
                    <button onClick={() => preencherEdicaoFuncionario(funcionario)} className="text-blue-400 hover:text-blue-600 transition-colors p-1" title="Editar">
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