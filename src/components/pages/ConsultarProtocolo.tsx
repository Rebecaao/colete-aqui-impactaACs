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
  const [protocoloBusca, setProtocoloBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<DadosColeta | null>(null);
  const [mensagemErro, setMensagemErro] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCarregando(true);
    setMensagemErro("");
    setResultado(null);

    try {
      const resposta = await fetch(
        `/api/coletas?protocolo=${encodeURIComponent(protocoloBusca.trim())}`,
      );
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Solicitação não encontrada.");
      }

      setResultado(dados.coleta);
    } catch (erro: any) {
      setMensagemErro(erro.message || "Erro ao buscar a solicitação.");
    } finally {
      setCarregando(false);
    }
  };
  const formatarDataBrasileira = (dataStr: string) => {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    if (!ano || !mes || !dia) return dataStr; // Retorna original se não estiver no padrão esperado
    return `${dia}/${mes}/${ano}`;
  };
  const handleCancelar = async () => {
    if (
      !resultado ||
      !confirm("Tem certeza que deseja cancelar esta solicitação de coleta?")
    ) {
      return;
    }

    setCancelando(true);
    try {
      const resposta = await fetch("/api/coletas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolo: resultado.protocolo }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem || "Não foi possível cancelar.");
      }

      setResultado({ ...resultado, status: "Cancelado" });
      alert("Solicitação cancelada com sucesso!");
    } catch (erro: any) {
      alert(erro.message || "Erro ao processar o cancelamento.");
    } finally {
      setCancelando(false);
    }
  };
  const coresStatus: Record<string, { bg: string; text: string }> = {
    Cancelado: { bg: "#f8d7da", text: "#721c24" },
    Pendente: { bg: "#fff3cd", text: "#856404" },
    Concluido: { bg: "#d4edda", text: "#155724" },
  };

  const estiloStatus = resultado
    ? coresStatus[resultado.status]
    : { bg: "#eee", text: "#333" };

  return (
    <section
      className="hero"
      style={{
        padding: "30px 20px",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h2>Consultar Solicitação</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Digite o código do seu protocólo para acompanhar o status da coleta.
      </p>

      <form
        onSubmit={handleSearch}
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
          value={protocoloBusca}
          onChange={(e) => setProtocoloBusca(e.target.value)}
          placeholder="Ex: REC-ABC1234"
          style={{
            padding: "10px 12px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "250px",
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

      {mensagemErro && (
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
          {mensagemErro}
        </div>
      )}

      {resultado && (
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
              Protocolo: {resultado.protocolo}
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
              {resultado.status}
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
              <strong>Solicitante:</strong> {resultado.nomeCompleto}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Telefone:</strong> {resultado.telefone}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Endereço:</strong> {resultado.endereco.logradouro}, nº{" "}
              {resultado.endereco.numero} - {resultado.endereco.bairro},{" "}
              {resultado.endereco.cidade}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Materiais:</strong> {resultado.materiais.join(", ")}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Data Sugerida:</strong>{" "}
              {formatarDataBrasileira(resultado.dataSugerida)}
            </p>
          </div>
          {/* {resultado.status !== "Cancelado" 
          //&& (
            // <button
            //   onClick={handleCancelar}
            //   disabled={cancelando}
            //   style={{
            //     marginTop: "15px",
            //     width: "100%",
            //     padding: "10px",
            //     backgroundColor: "#e74c3c",
            //     color: "#fff",
            //     border: "none",
            //     borderRadius: "6px",
            //     fontSize: "14px",
            //     fontWeight: "bold",
            //     cursor: cancelando ? "not-allowed" : "pointer",
            //   }}
            // >
            //   {cancelando ? "Cancelando..." : "Cancelar Solicitação"}
            // </button>
            
          } */}
        </div>
      )}
    </section>
  );
}
