import { useState} from 'react';
import { X } from 'lucide-react';


interface NewCourseModalProps{
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewCourseModal({ isOpen, onClose, onSuccess}: NewCourseModalProps){

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        duration: '',
        max_students: ''

    });

    if(!isOpen) return null;
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const payload = {
            name: formData.name,
            category: formData.category,
            duration: formData.duration,
            max_students: Number(formData.max_students)
        };
        try{
            const response = await fetch("http://localhost:8081/api/courses", {
            method: "POST",
            headers: { 
            "Content-Type": "application/json",
            "Authorization": token || ""
            },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            setFormData({ name: '', category: '', duration: '', max_students: '' });
            onSuccess(); 
        } else {
            alert("Erro ao criar o curso. Verifique os dados.");
        }
        } catch (error) {
        console.error("Erro na requisição:", error);
        }   
    }
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Criar Novo Curso</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Curso</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Desenvolvimento Web"
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Tecnologia"
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Duração</label>
              <input 
                type="text" 
                required
                placeholder="Ex: 12 meses"
                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.duration} 
                onChange={(e) => setFormData({...formData, duration: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Máx. de Alunos</label>
              <input 
                type="number" 
                required
                min="1"
                placeholder="Ex: 40"
                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.max_students} 
                onChange={(e) => setFormData({...formData, max_students: e.target.value})} 
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Salvar Curso
            </button>
          </div>
        </form>

      </div>
    </div>
    )
}