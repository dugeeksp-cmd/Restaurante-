import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pedido } from '../types';
import { ChefHat, Check, Clock, Trash2 } from 'lucide-react';

interface CozinhaPanelProps {
  pedidos: Pedido[];
  onMarcarPronto: (id: string) => void;
  onLimparHistorico: () => void;
}

export default function CozinhaPanel({ pedidos, onMarcarPronto, onLimparHistorico }: CozinhaPanelProps) {
  const pendentes = pedidos.filter(p => p.status === 'pendente');
  const prontos = pedidos.filter(p => p.status === 'pronto');

  // Sound Synth for completing an order (sizzling sound or positive chime)
  const tocarSomConclusao = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sizzling sound
      const bufferSize = context.sampleRate * 0.4;
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = context.createBufferSource();
      whiteNoise.buffer = buffer;
      
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.15, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
      
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      whiteNoise.start();

      // Simple sweet chime too
      const osc = context.createOscillator();
      const oscGain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, context.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      oscGain.gain.setValueAtTime(0.15, context.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      osc.connect(oscGain);
      oscGain.connect(context.destination);
      osc.start();
      osc.stop(context.currentTime + 0.3);
    } catch (e) {
      console.log("Audio synth error or blocked");
    }
  };

  const handleProntoClick = (id: string) => {
    tocarSomConclusao();
    onMarcarPronto(id);
  };

  return (
    <div id="cozinha-root" className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-5xl mx-auto overflow-hidden flex flex-col text-slate-800">
      
      {/* Header do Painel */}
      <div className="bg-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white p-2.5 rounded-xl shadow-md">
            <ChefHat size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 tracking-tight uppercase">
              🍳 PAINEL DA COZINHA (KDS)
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Fila de Preparação em Tempo Real</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="px-2.5 py-1 bg-amber-500 rounded-lg text-[10px] font-bold text-white uppercase shadow-sm">
              {pendentes.length} Pendentes
            </span>
            <span className="px-2.5 py-1 bg-slate-700 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
              {prontos.length} Concluídos
            </span>
          </div>

          {pedidos.length > 0 && (
            <button
              id="btn-cozinha-limpar"
              onClick={() => {
                if (window.confirm("Quer mesmo limpar todos os pedidos da brincadeira?")) {
                  onLimparHistorico();
                }
              }}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-colors border border-slate-700 hover:border-rose-500/30 px-2.5 py-1.5 rounded-lg bg-slate-700/40 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={11} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-6 space-y-8 bg-slate-50/50">
        
        {/* Tickets Ativos */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock size={12} /> Fila de Espera Ativa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {pendentes.length === 0 ? (
                <motion.div
                  id="cozinha-vazia-react"
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center justify-center shadow-inner"
                >
                  <span className="text-4xl mb-3">🍳</span>
                  <p className="text-sm font-bold text-slate-600">Nenhum prato para preparar agora!</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs px-4">Os novos pedidos enviados pelo Garçom aparecerão aqui instantaneamente!</p>
                </motion.div>
              ) : (
                pendentes.map(pedido => (
                  <motion.div
                    id={`ticket-${pedido.id}`}
                    key={pedido.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden flex flex-col justify-between ring-4 ring-amber-400/20 hover:border-orange-500 transition-all"
                  >
                    <div>
                      {/* Cabeçalho do Ticket */}
                      <div className="bg-amber-400 px-4 py-3 flex justify-between items-center text-slate-800 shadow-sm">
                        <span className="font-black text-slate-900 tracking-tight text-sm">MESA {String(pedido.mesa).padStart(2, '0')}</span>
                        <span className="text-[9px] font-black text-slate-700 bg-white/40 px-2 py-0.5 rounded uppercase tracking-wider">
                          AGORA
                        </span>
                      </div>

                      {/* Itens do Ticket */}
                      <div className="p-4 space-y-3 flex-1">
                        {(pedido.itens && Array.isArray(pedido.itens)
                          ? pedido.itens
                          : [
                              ...(pedido.pratos || []).map(p => ({ ...p, quantidade: 1 })),
                              ...(pedido.bebidas || []).map(b => ({ ...b, quantidade: 1 })),
                              ...(pedido.sobremesas || []).map(s => ({ ...s, quantidade: 1 }))
                            ]
                        ).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-base">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg text-lg shadow-sm">
                                {item.emoji}
                              </span>
                              <span className="font-semibold text-slate-700 text-sm uppercase">{item.nome}</span>
                            </div>
                            <span className="bg-green-100 text-green-800 font-black px-2.5 py-0.5 rounded-lg text-xs">
                              x{item.quantidade || 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {pedido.valorTotal !== undefined && (
                      <div className="px-4 pb-3 flex justify-between items-center text-xs text-slate-500 font-bold border-t border-slate-50 pt-2">
                        <span>VALOR TOTAL:</span>
                        <span className="text-amber-600 font-extrabold text-sm">R$ {pedido.valorTotal.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Botão Concluir */}
                    <button
                      id={`btn-pronto-${pedido.id}`}
                      onClick={() => handleProntoClick(pedido.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold text-xs py-3.5 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer border-t border-green-600/10"
                    >
                      <span>👨‍🍳</span> Pedido Pronto!
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Histórico Recente */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Check size={12} className="text-emerald-500" /> Entregues Recentemente
          </h3>
          
          {prontos.length === 0 ? (
            <p className="text-slate-400 text-xs italic">Nenhum pedido concluído ainda nesta sessão.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {prontos.slice().reverse().map(pedido => {
                const todosItens = pedido.itens && Array.isArray(pedido.itens)
                  ? pedido.itens
                  : [
                      ...(pedido.pratos || []),
                      ...(pedido.bebidas || []),
                      ...(pedido.sobremesas || [])
                    ];
                return (
                  <div key={pedido.id} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col justify-between opacity-70 hover:opacity-100 transition-all">
                    <div className="flex items-center justify-between mb-1.5 border-b border-slate-100 pb-1">
                      <span className="text-xs font-extrabold text-slate-700">Mesa {pedido.mesa}</span>
                      <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50 uppercase">Pronto</span>
                    </div>
                    <div className="text-sm truncate mb-1" title={todosItens.map(i => `${i.quantidade || 1}x ${i.nome}`).join(', ')}>
                      {todosItens.map(i => i.emoji).join(' ')}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-slate-400 font-medium">
                        {pedido.timestamp ? new Date(pedido.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                      {pedido.valorTotal !== undefined && (
                        <span className="text-[10px] font-black text-amber-600">
                          R$ {pedido.valorTotal.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
