import React, { FormEvent, useState } from "react";

type DadosColeta = {
  protocolo: string;
  nomeCompleto: string;
  telefone: string;
  email?: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
  };
  materiais: string[];
  dataSugerida: string;
  status: string;
  criadoEm: string;
};

export function ConsultarProtocolo() {
  const [termoBusca, setTermoBusca] = useState("");
  const [resultadoUnico, setResultadoUnico] = useState<any>(null);
  const [historicoColetas, setHistoricoColetas] = useState<any[] | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const formatarDataBrasileira = (dataStr: string) => {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    if (!ano || !mes || !dia) return dataStr;
    return `${dia}/${mes}/${ano}`;
  };

  const coresStatus: Record<string, { bg: string; text: string }> = {
    Cancelado: { bg: "#f8d7da", text: "#721c24" },
    Pendente: { bg: "#fff3cd", text: "#856404" },
    Concluido: { bg: "#d4edda", text: "#155724" },
  };

  // Função única de busca (detecta se é e-mail ou protocolo)
  const handleBuscaUnica = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = termoBusca.trim();
    if (!valor) return;

    setCarregando(true);
    setErro("");
    setResultadoUnico(null);
    setHistoricoColetas(null);

    // Identifica se o texto digitado contém "@" (é um e-mail) ou é um protocolo
    const ehEmail = valor.includes("@");
    const parametroQuery = ehEmail
      ? `email=${encodeURIComponent(valor)}`
      : `protocolo=${encodeURIComponent(valor)}`;

    try {
      const res = await fetch(`/api/coletas?${parametroQuery}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensagem || "Nenhum resultado encontrado.");
      }

      if (ehEmail) {
        setHistoricoColetas(data.coletas);
      } else {
        setResultadoUnico(data.coleta);
      }
    } catch (err: any) {
      setErro(err.message || "Erro ao realizar a busca.");
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelar = async () => {
    if (
      !resultadoUnico ||
      !confirm("Tem certeza que deseja cancelar esta solicitação de coleta?")
    ) {
      return;
    }

    setCancelando(true);
    try {
      const resposta = await fetch("/api/coletas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolo: resultadoUnico.protocolo }),
      });

      const dados = await resposta.json();
      if (!resposta.ok)
        throw new Error(dados.mensagem || "Não foi possível cancelar.");

      setResultadoUnico({ ...resultadoUnico, status: "Cancelado" });
      alert("Solicitação cancelada com sucesso!");
    } catch (erro: any) {
      alert(erro.message || "Erro ao processar o cancelamento.");
    } finally {
      setCancelando(false);
    }
  };

  const estiloStatus = resultadoUnico
    ? coresStatus[resultadoUnico.status] || coresStatus.Concluido
    : { bg: "#eee", text: "#333" };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        border: "1px solid #e1e8ed",
      }}
    >
      <h2>Consultar Solicitação</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Digite o código do seu <strong>protocolo</strong> ou o seu{" "}
        <strong>e-mail</strong> para acompanhar as coletas.
      </p>

      <form
        onSubmit={handleBuscaUnica}
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          required
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Ex: REC-ABC1234 ou seu@email.com"
          style={{
            padding: "10px 12px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            flex: 1,
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={carregando}
          className="btn btn-secundario"
          style={{
            cursor: carregando ? "not-allowed" : "pointer",
            padding: "10px 20px",
          }}
        >
          {carregando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {erro && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {erro}
        </div>
      )}

      {resultadoUnico && (
        <div
          style={{
            marginTop: "25px",
            textAlign: "left",
            background: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            border: "1px solid #e1e8ed",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#777",
                fontFamily: "monospace",
              }}
            >
              Protocolo: {resultadoUnico.protocolo}
            </span>
            <span
              style={{
                backgroundColor: estiloStatus.bg,
                color: estiloStatus.text,
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {resultadoUnico.status}
            </span>
          </div>

          <div
            style={{
              fontSize: "14px",
              color: "#333",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Solicitante:</strong> {resultadoUnico.nomeCompleto}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Telefone:</strong> {resultadoUnico.telefone}
            </p>
            <p style={{ margin: 0 }}>
              <strong>E-mail:</strong> {resultadoUnico.email}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Endereço:</strong> {resultadoUnico.endereco.logradouro},
              nº {resultadoUnico.endereco.numero} -{" "}
              {resultadoUnico.endereco.bairro}, {resultadoUnico.endereco.cidade}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Materiais:</strong> {resultadoUnico.materiais.join(", ")}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Data Sugerida:</strong>{" "}
              {formatarDataBrasileira(resultadoUnico.dataSugerida)}
            </p>
          </div>

          {/* {resultadoUnico.status !== "Cancelado" && (
            <button
              onClick={handleCancelar}
              disabled={cancelando}
              style={{
                marginTop: "15px",
                width: "100%",
                padding: "10px",
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: cancelando ? "not-allowed" : "pointer",
              }}
            >
              {cancelando ? "Cancelando..." : "Cancelar Solicitação"}
            </button>
          )} */}
        </div>
      )}

      {/* Exibição do Histórico (Caso busque por E-mail) */}
      {historicoColetas && (
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#333",
              margin: 0,
            }}
          >
            Encontradas {historicoColetas.length} solicitação(ões) para este
            e-mail:
          </p>
          {historicoColetas.map((item) => {
            const estiloItem =
              coresStatus[item.status] || coresStatus.Concluido;
            return (
              <div
                key={item.protocolo}
                style={{
                  background: "#fdfdfd",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #e1e8ed",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "#555",
                    }}
                  >
                    Protocolo: {item.protocolo}
                  </span>
                  <span
                    style={{
                      backgroundColor: estiloItem.bg,
                      color: estiloItem.text,
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#444",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>Data:</strong>{" "}
                    {formatarDataBrasileira(item.dataSugerida)}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Materiais:</strong> {item.materiais.join(", ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
