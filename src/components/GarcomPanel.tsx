import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pratos, bebidas, sobremesas } from '../data';
import { MenuItem, Pedido, PedidoItem } from '../types';
import { Bell, Check, ShoppingBag, Send, AlertTriangle } from 'lucide-react';

interface GarcomPanelProps {
  pedidos: Pedido[];
  onEnviarPedido: (pedido: Omit<Pedido, 'id' | 'status' | 'timestamp'>) => void;
}

export default function GarcomPanel({ pedidos, onEnviarPedido }: GarcomPanelProps) {
  const [mesa, setMesa] = useState<string>('');
  const [selecao, setSelecao] = useState<{
    pratos: MenuItem[];
    bebidas: MenuItem[];
    sobremesas: MenuItem[];
  }>({
    pratos: [],
    bebidas: [],
    sobremesas: []
  });

  // Track the sent order IDs to detect when they change from 'pendente' to 'pronto'
  const [sentOrderIds, setSentOrderIds] = useState<string[]>([]);
  const [alertaMesa, setAlertaMesa] = useState<number | null>(null);

  // Sound Synth for notification (bell sound)
  const tocarSininho = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = context.createOscillator();
      const gain1 = context.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, context.currentTime); // A5
      gain1.gain.setValueAtTime(0.3, context.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(context.destination);
      osc1.start();
      osc1.stop(context.currentTime + 0.8);

      setTimeout(() => {
        const osc2 = context.createOscillator();
        const gain2 = context.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, context.currentTime); // E6
        gain2.gain.setValueAtTime(0.3, context.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1.2);
        osc2.connect(gain2);
        gain2.connect(context.destination);
        osc2.start();
        osc2.stop(context.currentTime + 1.2);
      }, 150);
    } catch (e) {
      console.log("Web Audio not supported or blocked by user gesture");
    }
  };

  // Watch for order status changes
  useEffect(() => {
    pedidos.forEach(p => {
      if (p.status === 'pronto' && sentOrderIds.includes(p.id)) {
        // Trigger alert
        setAlertaMesa(p.mesa);
        tocarSininho();
        // Remove from tracked sent list so it only alerts once
        setSentOrderIds(prev => prev.filter(id => id !== p.id));
      }
    });
  }, [pedidos, sentOrderIds]);

  const toggleItem = (item: MenuItem, categoria: 'pratos' | 'bebidas' | 'sobremesas') => {
    setSelecao(prev => {
      const lista = prev[categoria];
      const existe = lista.some(i => i.id === item.id);
      if (existe) {
        return {
          ...prev,
          [categoria]: lista.filter(i => i.id !== item.id)
        };
      } else {
        return {
          ...prev,
          [categoria]: [...lista, item]
        };
      }
    });
  };

  const handleEnviar = () => {
    if (!mesa) {
      alert("Ops! Por favor, digite o número da mesa antes de enviar o pedido.");
      return;
    }

    const totalItens = selecao.pratos.length + selecao.bebidas.length + selecao.sobremesas.length;
    if (totalItens === 0) {
      alert("Hum... escolha pelo menos um prato, bebida ou sobremesa para enviar!");
      return;
    }

    // Save temporary id generation to track status
    const tempId = "ped_" + Math.random().toString(36).substring(2, 9);
    
    // Call parent handler
    onEnviarPedido({
      mesa: parseInt(mesa),
      pratos: selecao.pratos,
      bebidas: selecao.bebidas,
      sobremesas: selecao.sobremesas
    });

    // Add to tracked list (parent will add with same details, we'll map or match)
    // To make it easy, we will search for any active pending order for this table
    // and track its future completion.
    setTimeout(() => {
      // Find the latest pending order for this table and track its ID
      const latestPedido = pedidos.find(p => p.mesa === parseInt(mesa) && p.status === 'pendente');
      if (latestPedido) {
        setSentOrderIds(prev => [...prev, latestPedido.id]);
      } else {
        // Fallback: track all pending for this table
        const matching = pedidos.filter(p => p.mesa === parseInt(mesa) && p.status === 'pendente').map(p => p.id);
        setSentOrderIds(prev => Array.from(new Set([...prev, ...matching])));
      }
    }, 100);

    // Clear local selections
    setSelecao({ pratos: [], bebidas: [], sobremesas: [] });
    setMesa('');
  };

  const isSelected = (item: MenuItem, categoria: 'pratos' | 'bebidas' | 'sobremesas') => {
    return selecao[categoria].some(i => i.id === item.id);
  };

  return (
    <div id="garcom-root" class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg mx-auto relative overflow-hidden flex flex-col">
      
      {/* Header do Painel */}
      <div class="bg-orange-500 p-5 text-white flex justify-between items-center shadow-md">
        <h2 class="text-sm font-extrabold flex items-center gap-2 tracking-tight uppercase">
          <span>📝</span> MODO GARÇOM
        </h2>
        <div class="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider font-mono">
          {mesa ? `MESA: ${mesa.padStart(2, '0')}` : 'MESA: --'}
        </div>
      </div>

      <div class="p-5 space-y-6">
        
        {/* Camada 1: Entrada da Mesa */}
        <section class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div class="flex items-center space-x-3 mb-3">
            <span class="text-2xl">📍</span>
            <label htmlFor="mesa-input-react" class="text-xs font-bold text-slate-400 uppercase tracking-widest">Qual é o número da Mesa?</label>
          </div>
          <input
            id="mesa-input-react"
            type="number"
            placeholder="Ex: 3"
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            min="1"
            max="99"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-slate-800"
          />
        </section>

        {/* Camada 2: Pratos */}
        <section class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🥘</span> Pratos Principais
          </h3>
          <div class="grid grid-cols-2 gap-2">
            {pratos.map(item => {
              const selected = isSelected(item, 'pratos');
              return (
                <motion.button
                  id={`btn-prato-${item.id}`}
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(item, 'pratos')}
                  class={`flex items-center p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    selected 
                      ? 'border-2 border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100 font-bold' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-700'
                  }`}
                >
                  <span class="text-3xl mr-3">{item.emoji}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold leading-tight truncate uppercase">{item.nome}</p>
                    {selected && <span class="text-[9px] text-orange-600 font-bold flex items-center gap-0.5 mt-0.5"><Check size={9} /> Ativo</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Camada 3: Bebidas */}
        <section class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🥤</span> Bebidas Geladas
          </h3>
          <div class="grid grid-cols-2 gap-2">
            {bebidas.map(item => {
              const selected = isSelected(item, 'bebidas');
              return (
                <motion.button
                  id={`btn-bebida-${item.id}`}
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(item, 'bebidas')}
                  class={`flex items-center p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    selected 
                      ? 'border-2 border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100 font-bold' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-700'
                  }`}
                >
                  <span class="text-3xl mr-3">{item.emoji}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold leading-tight truncate uppercase">{item.nome}</p>
                    {selected && <span class="text-[9px] text-orange-600 font-bold flex items-center gap-0.5 mt-0.5"><Check size={9} /> Ativo</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Camada 4: Sobremesas */}
        <section class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🍮</span> Sobremesas Doces
          </h3>
          <div class="grid grid-cols-2 gap-2">
            {sobremesas.map(item => {
              const selected = isSelected(item, 'sobremesas');
              return (
                <motion.button
                  id={`btn-sobremesa-${item.id}`}
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(item, 'sobremesas')}
                  class={`flex items-center p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    selected 
                      ? 'border-2 border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100 font-bold' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:text-slate-700'
                  }`}
                >
                  <span class="text-3xl mr-3">{item.emoji}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold leading-tight truncate uppercase">{item.nome}</p>
                    {selected && <span class="text-[9px] text-orange-600 font-bold flex items-center gap-0.5 mt-0.5"><Check size={9} /> Ativo</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Camada 5: Resumo e Envio */}
        <section class="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
          <div class="bg-white rounded-xl border border-orange-100 p-3">
            <p class="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Resumo do Pedido</p>
            
            <div class="text-sm font-bold text-slate-700">
              {mesa ? (
                <div class="text-xs text-orange-700 font-black mb-2 flex items-center gap-1">
                  <span>📍</span> Mesa Selecionada: <span class="underline">Mesa {mesa}</span>
                </div>
              ) : (
                <div class="text-rose-500 text-xs font-bold flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={13} /> Informe o número da mesa!
                </div>
              )}

              {selecao.pratos.length === 0 && selecao.bebidas.length === 0 && selecao.sobremesas.length === 0 ? (
                <p class="text-slate-400 font-medium py-1 text-xs italic">Nenhum item selecionado ainda...</p>
              ) : (
                <p class="text-slate-700 text-xs leading-relaxed">
                  {[
                    ...selecao.pratos.map(p => `1x ${p.emoji} ${p.nome}`),
                    ...selecao.bebidas.map(b => `1x ${b.emoji} ${b.nome}`),
                    ...selecao.sobremesas.map(s => `1x ${s.emoji} ${s.nome}`)
                  ].join(', ')}
                </p>
              )}
            </div>
          </div>

          <button
            id="btn-enviar-pedido"
            onClick={handleEnviar}
            class="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 uppercase tracking-tighter text-md cursor-pointer transform active:scale-98 transition-all"
          >
            <Send size={16} /> Enviar Pedido
          </button>
        </section>

      </div>

      {/* MODAL DE ALERTA DE PEDIDO PRONTO */}
      <AnimatePresence>
        {alertaMesa !== null && (
          <motion.div 
            id="modal-alerta-pronto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.85, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 50 }}
              class="bg-white rounded-3xl p-6 max-w-sm w-full text-center border-t-8 border-orange-500 shadow-2xl relative ring-4 ring-orange-500/10"
            >
              <div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <span class="text-4xl">🔔</span>
              </div>
              <h3 class="text-xl font-black text-orange-600 uppercase tracking-tight">Atenção Garçom!</h3>
              <p class="text-slate-600 font-bold text-sm mt-2 mb-6">
                O pedido da <span class="text-orange-600 font-black">Mesa {alertaMesa}</span> já está pronto na cozinha!
              </p>
              <button
                id="btn-fechar-alerta"
                onClick={() => setAlertaMesa(null)}
                class="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
              >
                Entendido / Retirar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
