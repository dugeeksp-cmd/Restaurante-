import React, { useState, useEffect } from 'react';
import GarcomPanel from './components/GarcomPanel';
import CozinhaPanel from './components/CozinhaPanel';
import HtmlExporter from './components/HtmlExporter';
import { Pedido } from './types';
import { ChefHat, ShoppingBag, SplitSquareVertical, FileCode, Utensils, Award } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'split' | 'garcom' | 'cozinha' | 'export'>('split');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Synchronize with local storage for cross-tab simulation (Waiter in one tab, Kitchen in another)
  useEffect(() => {
    const syncPedidos = () => {
      const stored = localStorage.getItem('pedidos_locais');
      if (stored) {
        setPedidos(JSON.parse(stored));
      } else {
        setPedidos([]);
      }
    };

    window.addEventListener('storage', syncPedidos);
    syncPedidos(); // Initial sync

    return () => {
      window.removeEventListener('storage', syncPedidos);
    };
  }, []);

  const handleEnviarPedido = (pedidoData: Omit<Pedido, 'id' | 'status' | 'timestamp'>) => {
    const novo: Pedido = {
      id: "ped_" + Math.random().toString(36).substring(2, 9),
      mesa: pedidoData.mesa,
      pratos: pedidoData.pratos,
      bebidas: pedidoData.bebidas,
      sobremesas: pedidoData.sobremesas,
      status: 'pendente',
      timestamp: new Date().toISOString()
    };

    const atualizados = [...pedidos, novo];
    setPedidos(atualizados);
    localStorage.setItem('pedidos_locais', JSON.stringify(atualizados));
    
    // Disparar o evento manualmente para que abas irmãs e componentes locais atualizem na hora
    window.dispatchEvent(new Event('storage'));
  };

  const handleMarcarPronto = (id: string) => {
    const atualizados = pedidos.map(p => 
      p.id === id ? { ...p, status: 'pronto' as const } : p
    );
    setPedidos(atualizados);
    localStorage.setItem('pedidos_locais', JSON.stringify(atualizados));
    window.dispatchEvent(new Event('storage'));
  };

  const handleLimparHistorico = () => {
    setPedidos([]);
    localStorage.removeItem('pedidos_locais');
    localStorage.removeItem('pedidos_enviados_garcom');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16 flex flex-col font-sans selection:bg-amber-200">
      
      {/* Barra de Navegação Central */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-orange-500/20">
              👨‍🍳
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                PEQUENO CHEF <span className="text-orange-500 underline decoration-3 decoration-orange-500">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Sistema de Pedidos em Tempo Real
              </p>
            </div>
          </div>

          {/* Seletor de Telas */}
          <div className="flex flex-wrap justify-center bg-slate-100 p-1 rounded-2xl border border-slate-200/60 w-full md:w-auto">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'split' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SplitSquareVertical size={14} />
              Tela Dupla (Demo)
            </button>
            <button
              onClick={() => setViewMode('garcom')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'garcom' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag size={14} />
              Garçom
            </button>
            <button
              onClick={() => setViewMode('cozinha')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cozinha' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ChefHat size={14} />
              Cozinha
            </button>
            <button
              onClick={() => setViewMode('export')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'export' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCode size={14} />
              Exportar HTMLs
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal de acordo com o modo de visualização */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-8">
        
        {viewMode === 'split' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-4 bg-gradient-to-r from-orange-500 to-amber-600 p-6 rounded-3xl text-white shadow-lg shadow-orange-500/10">
              <span className="text-3xl">✨</span>
              <h2 className="text-xl font-bold mt-1">Ambiente de Demonstração (Tela Dupla)</h2>
              <p className="text-xs text-orange-50 mt-1 leading-relaxed">
                Aqui você pode brincar de garçom e de cozinheiro na mesma tela! 
                Perfeito para testar a brincadeira. Digite uma mesa e mande pratos do lado esquerdo (Garçom), e veja-os aparecer na hora do lado direito (Cozinha)!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <GarcomPanel 
                  pedidos={pedidos} 
                  onEnviarPedido={handleEnviarPedido} 
                />
              </div>
              <div className="lg:col-span-7">
                <CozinhaPanel 
                  pedidos={pedidos} 
                  onMarcarPronto={handleMarcarPronto} 
                  onLimparHistorico={handleLimparHistorico}
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'garcom' && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6 text-slate-500 text-xs font-bold bg-slate-100 py-2.5 px-4 rounded-xl border border-slate-200/50">
              💡 Abra o painel da Cozinha em outra aba do navegador para ver a sincronia em tempo real!
            </div>
            <GarcomPanel 
              pedidos={pedidos} 
              onEnviarPedido={handleEnviarPedido} 
            />
          </div>
        )}

        {viewMode === 'cozinha' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 text-slate-500 text-xs font-bold bg-slate-100 py-2.5 px-4 rounded-xl border border-slate-200/50">
              💡 Abra o painel do Garçom em outra aba do navegador para enviar pedidos em tempo real!
            </div>
            <CozinhaPanel 
              pedidos={pedidos} 
              onMarcarPronto={handleMarcarPronto} 
              onLimparHistorico={handleLimparHistorico}
            />
          </div>
        )}

        {viewMode === 'export' && (
          <HtmlExporter />
        )}

      </main>

      {/* Footer minimalista e lúdico */}
      <footer className="text-center text-slate-400 text-xs py-8 border-t border-slate-200/60 mt-12">
        <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
          <Award size={14} className="text-amber-500" />
          <span>Desenvolvido com carinho para crianças brincarem juntas</span>
        </div>
        <p>© 2026 Restaurante Real-Time Play • Baseado no Google Firebase Firestore</p>
      </footer>

    </div>
  );
}
