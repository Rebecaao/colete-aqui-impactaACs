import { useState } from "react";

export function ConsultarProtocolo() {
  const [termoBusca, setTermoBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  const [resultadoUnico, setResultadoUnico] = useState<any>(null);
  const [historicoColetas, setHistoricoColetas] = useState<any[] | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const formatarDataBrasileira = (dataStr: string) => {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    if (!ano || !mes || !dia) return dataStr;
    return `${dia}/${mes}/${ano}`;
  };
  const formatarDataHora = (dataStr: string) => {
    if (!dataStr) return "";
    try {
      const data = new Date(dataStr);
      return data.toLocaleDateString("pt-BR");
    } catch {
      return dataStr;
    }
  };

  const coresStatus: Record<string, { bg: string; text: string }> = {
    Pendente: { bg: "#fff3cd", text: "#856404" },
    Agendado: { bg: "#cce5ff", text: "#004085" },
    Concluido: { bg: "#d4edda", text: "#155724" },
    Cancelado: { bg: "#f8d7da", text: "#721c24" },
  };

  const realizarBusca = async (statusManual?: string) => {
    const valor = termoBusca.trim();
    if (!valor) return;

    setCarregando(true);
    setErro("");

    const ehEmail = valor.includes("@");

    const statusAplicado =
      statusManual !== undefined ? statusManual : statusFiltro;

    let parametroQuery = ehEmail
      ? `email=${encodeURIComponent(valor)}`
      : `protocolo=${encodeURIComponent(valor)}`;

    if (ehEmail && statusAplicado !== "TODOS") {
      parametroQuery += `&status=${encodeURIComponent(statusAplicado)}`;
    }

    try {
      const res = await fetch(`/api/coletas?${parametroQuery}`);
      const data = await res.json();

      if (!res.ok) {
        if (ehEmail) {
          setHistoricoColetas([]);
          setResultadoUnico(null);
        } else {
          setResultadoUnico(null);
          setHistoricoColetas(null);
        }
        setErro(data.mensagem || "Nenhum resultado encontrado.");
        return;
      }

      if (ehEmail) {
        setResultadoUnico(null);
        setHistoricoColetas(data.coletas || []);
      } else {
        setHistoricoColetas(null);
        setResultadoUnico(data.coleta);
      }
    } catch (err: any) {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const handleBuscaForm = (e: React.FormEvent) => {
    e.preventDefault();
    realizarBusca();
  };
  const handleCancelar = async (protocolo: string) => {
    const motivo = window.prompt(
      "Digite o motivo do cancelamento (mínimo de 5 caracteres):",
    );

    if (motivo === null) return;

    const motivoFormatado = motivo.trim();

    if (motivoFormatado.length < 5) {
      alert("O motivo deve ter pelo menos 5 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch("/api/coletas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolo: protocolo.trim(),
          motivoCancelamento: motivoFormatado,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensagem || "Erro ao cancelar.");
        return;
      }

      alert("Solicitação cancelada com sucesso!");
      realizarBusca();
    } catch (err) {
      alert("Falha de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

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
        Digite seu <strong>protocolo</strong> ou <strong>e-mail</strong> para
        acompanhar as coletas.
      </p>

      <form
        onSubmit={handleBuscaForm}
        style={{ marginTop: "20px", display: "flex", gap: "10px" }}
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
          style={{
            cursor: carregando ? "not-allowed" : "pointer",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#2ecc71",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          {carregando ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {erro && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "5px",
            fontSize: "13px",
          }}
        >
          {erro}
        </div>
      )}

      {resultadoUnico && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#fff",
            borderRadius: "8px",
            border: "1px solid #e1e8ed",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
              Protocolo: {resultadoUnico.protocolo}
            </span>
            <span
              style={{
                backgroundColor:
                  coresStatus[resultadoUnico.status]?.bg || "#eee",
                color: coresStatus[resultadoUnico.status]?.text || "#333",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              {resultadoUnico.status}
            </span>
          </div>

          <p style={{ margin: "4px 0", fontSize: "13px" }}>
            <strong>Solicitante:</strong> {resultadoUnico.nomeCompleto}
          </p>
          <p style={{ margin: "4px 0", fontSize: "13px" }}>
            <strong>Materiais:</strong> {resultadoUnico.materiais.join(", ")}
          </p>
          <p style={{ margin: "4px 0", fontSize: "13px" }}>
            <strong>Data Sugerida:</strong>{" "}
            {formatarDataBrasileira(resultadoUnico.dataSugerida)}
          </p>

          {resultadoUnico.status === "Cancelado" && (
            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                background: "#fdf3f2",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#721c24",
              }}
            >
              {resultadoUnico.motivoCancelamento && (
                <p style={{ margin: "2px 0" }}>
                  <strong>Motivo:</strong> {resultadoUnico.motivoCancelamento}
                </p>
              )}
              {resultadoUnico.canceladoEm && (
                <p style={{ margin: "2px 0" }}>
                  <strong>Cancelado em:</strong>{" "}
                  {formatarDataHora(resultadoUnico.canceladoEm)}
                </p>
              )}
            </div>
          )}

          {resultadoUnico.status === "Pendente" && (
            <button
              type="button"
              onClick={() => handleCancelar(resultadoUnico.protocolo)}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "8px",
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Cancelar Solicitação
            </button>
          )}
        </div>
      )}

      {historicoColetas && (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#333" }}>
                Histórico de Solicitações
              </h3>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {historicoColetas.length}{" "}
                {historicoColetas.length === 1
                  ? "registro encontrado"
                  : "registros encontrados"}
              </span>
            </div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "12px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="TODOS">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Agendado">Agendado</option>
              <option value="Concluido">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {historicoColetas.length === 0 && (
            <p style={{ color: "#666", fontSize: "13px" }}>
              Nenhuma solicitação encontrada para o filtro selecionado.
            </p>
          )}

          <div
            style={{
              maxHeight: "350px",
              overflowY: "auto",
              paddingRight: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {historicoColetas.map((item) => {
              const estiloItem = coresStatus[item.status] || {
                bg: "#eee",
                text: "#333",
              };
              return (
                <div
                  key={item.protocolo}
                  style={{
                    background: "#fdfdfd",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #e1e8ed",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "#666",
                      }}
                    >
                      {item.protocolo}
                    </span>
                    <span
                      style={{
                        backgroundColor: estiloItem.bg,
                        color: estiloItem.text,
                        padding: "2px 6px",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p style={{ margin: "2px 0", fontSize: "12px" }}>
                    <strong>Data escolhida para coleta:</strong>{" "}
                    {formatarDataBrasileira(item.dataSugerida)}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: "12px" }}>
                    <strong>Materiais:</strong> {item.materiais.join(", ")}
                  </p>

                  {item.status === "Cancelado" && (
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "6px",
                        background: "#fdf3f2",
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: "#721c24",
                      }}
                    >
                      {item.motivoCancelamento && (
                        <p style={{ margin: "2px 0" }}>
                          <strong>Motivo:</strong> {item.motivoCancelamento}
                        </p>
                      )}
                      {item.canceladoEm && (
                        <p style={{ margin: "2px 0" }}>
                          <strong>Cancelado em:</strong>{" "}
                          {formatarDataHora(item.canceladoEm)}
                        </p>
                      )}
                    </div>
                  )}

                  {item.status === "Pendente" && (
                    <button
                      type="button"
                      onClick={() => handleCancelar(item.protocolo)}
                      style={{
                        marginTop: "8px",
                        width: "100%",
                        padding: "6px",
                        backgroundColor: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar Solicitação
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
