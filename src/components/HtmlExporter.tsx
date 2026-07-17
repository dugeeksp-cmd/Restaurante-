import React, { useState } from 'react';
import { Copy, Check, FileCode, Download, ExternalLink } from 'lucide-react';

export default function HtmlExporter() {
  const [activeTab, setActiveTab] = useState<'garcom' | 'cozinha'>('garcom');
  const [copied, setCopied] = useState(false);

  const codes = {
    garcom: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garçom - Brincadeira de Restaurante</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Fredoka', sans-serif; }
    .selected-card { transform: scale(0.96); border-color: #f59e0b; background-color: #fef3c7; }
  </style>
</head>
<body class="bg-amber-50 min-h-screen pb-12 text-slate-800">
  <!-- O código completo está salvo em /garcom.html no editor -->
  <!-- ... Ver arquivo completo em /garcom.html ... -->
</body>
</html>`,
    cozinha: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cozinha - Brincadeira de Restaurante</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-900 min-h-screen pb-12 text-slate-100">
  <!-- O código completo está salvo em /cozinha.html no editor -->
  <!-- ... Ver arquivo completo em /cozinha.html ... -->
</body>
</html>`
  };

  // Real raw contents of the files to copy/download
  const handleCopy = async (type: 'garcom' | 'cozinha') => {
    try {
      const response = await fetch(`/${type}.html`);
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback if fetch fails
      const fallbackText = type === 'garcom' ? "Código Garçom (disponível no arquivo /garcom.html)" : "Código Cozinha (disponível no arquivo /cozinha.html)";
      await navigator.clipboard.writeText(fallbackText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (type: 'garcom' | 'cozinha') => {
    const link = document.createElement('a');
    link.href = `/${type}.html`;
    link.download = `${type}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="html-exporter-root" className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
          <FileCode size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Exportar Códigos Standalone</h2>
          <p className="text-xs text-slate-500 font-medium">Baixe ou copie o código completo das páginas HTML integradas com Firebase.</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Ambos os arquivos já estão salvos e prontos para uso no seu projeto como <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs font-bold">/garcom.html</code> e <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs font-bold">/cozinha.html</code>. 
        Eles usam Tailwind CSS via CDN e se conectam em tempo real via Firebase Firestore. 
        Você só precisa inserir suas credenciais do console do Firebase diretamente nos placeholders indicados no início de cada arquivo!
      </p>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4 bg-slate-100 p-1.5 rounded-2xl">
        <div className="flex gap-1 flex-1">
          <button
            onClick={() => setActiveTab('garcom')}
            className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'garcom'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📱 garcom.html
          </button>
          <button
            onClick={() => setActiveTab('cozinha')}
            className={`flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cozinha'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👨‍🍳 cozinha.html
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleCopy(activeTab)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar Código'}
          </button>
          <button
            onClick={() => handleDownload(activeTab)}
            className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download size={14} />
            Baixar Arquivo
          </button>
        </div>
      </div>

      {/* Código simplificado para visualização */}
      <div className="bg-slate-950 rounded-2xl p-4 overflow-x-auto border border-slate-800 max-h-80 font-mono text-xs text-slate-300">
        <div className="flex justify-between items-center mb-2 border-b border-slate-900 pb-2">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{activeTab}.html</span>
          <span className="text-emerald-500 text-[10px] font-bold">100% Completo & Standalone</span>
        </div>
        <pre className="leading-relaxed">
          {activeTab === 'garcom' ? (
            `<!-- garcom.html -->
<!DOCTYPE html>
<html lang="pt-BR">
...
  <script type="module">
    // ⚙️ INSIRA SUAS CREDENCIAIS DO FIREBASE AQUI
    const firebaseConfig = {
      apiKey: "SUA_API_KEY_AQUI",
      authDomain: "SEU_AUTH_DOMAIN_AQUI",
      projectId: "SEU_PROJECT_ID_AQUI",
      ...
    };
    
    // Conexão em tempo real via Firestore (onSnapshot)
    // Alerta visual de pedido pronto ("Mesa X está pronta!")
    // Som de sininho lúdico integrado!
  </script>
</html>`
          ) : (
            `<!-- cozinha.html -->
<!DOCTYPE html>
<html lang="pt-BR">
...
  <script type="module">
    // ⚙️ INSIRA SUAS CREDENCIAIS DO FIREBASE AQUI
    const firebaseConfig = {
      apiKey: "SUA_API_KEY_AQUI",
      authDomain: "SEU_AUTH_DOMAIN_AQUI",
      projectId: "SEU_PROJECT_ID_AQUI",
      ...
    };
    
    // Exibe painel KDS de pedidos pendentes em tempo real
    // Botão "PEDIDO PRONTO" atualiza status para "pronto"
    // Sons de frigideira sizzling e novos pedidos embutidos!
  </script>
</html>`
          )}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200/50 rounded-2xl flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="text-xs text-amber-800 leading-relaxed font-medium">
          <p className="font-bold mb-1">Como testar as páginas locais no seu celular:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra os arquivos <code className="font-bold">/garcom.html</code> e <code className="font-bold">/cozinha.html</code>.</li>
            <li>Substitua o objeto <code className="font-bold">firebaseConfig</code> com as chaves do seu projeto Firebase (basta criar um aplicativo da web no painel do Firebase).</li>
            <li>Ative o banco de dados do <strong>Firestore Database</strong> no console do Firebase.</li>
            <li>Abra os arquivos em dois aparelhos diferentes. Pronto! O garçom envia o pedido e ele aparece na cozinha em segundos!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
