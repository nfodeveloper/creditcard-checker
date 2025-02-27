import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, Copy } from 'lucide-react';

function App() {
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'APROVADAS' | 'REPROVADAS'>('APROVADAS');
  const [liveResults, setLiveResults] = useState<string[]>([]);
  const [dieResults, setDieResults] = useState<string[]>([]);
  const [totalChecked, setTotalChecked] = useState<number>(0);

  const handleCheck = async () => {
    if (!inputValue.trim()) return;
    
    const lines = inputValue.split('\n').filter(line => line.trim());
    setTotalChecked(prev => prev + lines.length);
    setLoading(true);
    
    for (const line of lines) {
      try {
        const response = await fetch(`http://api/?lista=${encodeURIComponent(line)}`);
        const resultText = await response.text();
        
        try {
          const resultJson = JSON.parse(resultText);
          
          if (resultJson.status === "AUTORIZADO") {
            console.log(`Linha: ${line} - Status: AUTORIZADO`);
            setLiveResults(prev => [...prev, line]);
          } else if (resultJson.status === "REPROVADO") {
            console.log(`Linha: ${line} - Status: REPROVADO`);
            setDieResults(prev => [...prev, line]);
          }
        } catch (jsonError) {
          if (resultText.includes("AUTORIZADO")) {
            console.log(`Linha: ${line} - Status: AUTORIZADO`);
            setLiveResults(prev => [...prev, line]);
          } else if (resultText.includes("REPROVADO")) {
            console.log(`Linha: ${line} - Status: REPROVADO`);
            setDieResults(prev => [...prev, line]);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar linha:', line, error);
        setDieResults(prev => [...prev, line]);
      }
    }
    
    setLoading(false);
    setInputValue('');
  };

  const copyToClipboard = (text: string[]) => {
    navigator.clipboard.writeText(text.join('\n'));
  };

  const clearResults = () => {
    if (activeTab === 'APROVADAS') {
      setLiveResults([]);
    } else {
      setDieResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
          GATE: CIELO (DEBITANDO R$6.00)
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        {/* Input Section */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="bg-gray-800 rounded-lg p-4 flex-1">
            <textarea
              className="w-full h-64 bg-gray-900 text-white p-3 rounded-md border border-gray-700 focus:outline-none focus:border-white resize-none"
              placeholder="FORMATO ACEITO 5443159155457193|10|2028|019"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Total Verificado: {totalChecked} | Aprovadas: {liveResults.length} | Reprovadas: {dieResults.length}
              </div>
              <button
                onClick={handleCheck}
                disabled={loading || !inputValue.trim()}
                className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white px-6 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Verificar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="bg-gray-800 rounded-lg p-4 flex-1">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-4">
              <button
                className={`flex-1 py-2 font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'APROVADAS'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('APROVADAS')}
              >
                <Check className="w-4 h-4" />
                APROVADAS ({liveResults.length})
              </button>
              <button
                className={`flex-1 py-2 font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'REPROVADAS'
                    ? 'text-red-400 border-b-2 border-red-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('REPROVADAS')}
              >
                <X className="w-4 h-4" />
                REPROVADAS ({dieResults.length})
              </button>
            </div>

            {/* Results */}
            <div className="relative">
              <div className="h-64 bg-gray-900 text-white p-3 rounded-md border border-gray-700 overflow-y-auto">
                {activeTab === 'APROVADAS' ? (
                  liveResults.length > 0 ? (
                    <ul className="space-y-1">
                      {liveResults.map((item, index) => (
                        <li key={index} className="text-green-400 font-mono">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Nenhum resultado aprovado ainda
                    </div>
                  )
                ) : dieResults.length > 0 ? (
                  <ul className="space-y-1">
                    {dieResults.map((item, index) => (
                      <li key={index} className="text-red-400 font-mono">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Nenhum resultado reprovado ainda
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={clearResults}
                  className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
                  disabled={(activeTab === 'APROVADAS' && liveResults.length === 0) || (activeTab === 'REPROVADAS' && dieResults.length === 0)}
                >
                  <X className="w-4 h-4" />
                  Limpar
                </button>
                <button
                  onClick={() => copyToClipboard(activeTab === 'APROVADAS' ? liveResults : dieResults)}
                  className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
                  disabled={(activeTab === 'APROVADAS' && liveResults.length === 0) || (activeTab === 'REPROVADAS' && dieResults.length === 0)}
                >
                  <Copy className="w-4 h-4" />
                  Copiar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-800 text-center text-gray-500 text-sm">
        NFO Checker | GATE: Cielo - {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;