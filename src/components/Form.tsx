import React, { FormEvent, useState } from "react";
import { InputForm } from "./InputForm";
import { ModalProtocolo } from "./ModalProtocolo";
import { ButtonForm } from "./ButtonForm";

type SolicitarSectionProps = {
  onSubmitSuccess?: () => void;
};

function calcularDataMinimaUteis() {
  let dias = 0,
    data = new Date();
  data.setHours(0, 0, 0, 0);
  while (dias < 2) {
    data.setDate(data.getDate() + 1);
    if (data.getDay() !== 0 && data.getDay() !== 6) dias++;
  }
  return data.toISOString().split("T")[0];
}

export function SolicitarSection({ onSubmitSuccess }: SolicitarSectionProps) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    dataSugerida: "",
  });
  const [materiais, setMateriais] = useState<string[]>([]);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [errosApiGeral, setErrosApiGeral] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  const apenasNum = (v: string) => v.replace(/\D/g, "");
  const atualizar = (campo: string, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = apenasNum(e.target.value);
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) return alert("CEP não encontrado.");
      setForm((f) => ({
        ...f,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
      }));
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErrosApiGeral(null);
    setErros({});
    try {
      const res = await fetch("/api/coletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto: form.nome,
          telefone: form.telefone,
          email: form.email,
          endereco: {
            cep: form.cep,
            logradouro: form.logradouro,
            numero: form.numero,
            bairro: form.bairro,
            cidade: form.cidade,
          },
          materiais,
          dataSugerida: form.dataSugerida,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.erros) {
          const mapErros: Record<string, string> = {};
          Object.keys(data.erros).forEach((k) => {
            if (data.erros[k]?._errors?.[0])
              mapErros[k] = data.erros[k]._errors[0];
          });
          setErros(mapErros);
        }
        throw new Error(data.mensagem || "Verifique os campos.");
      }

      setMensagemSucesso(
        data.mensagem || "Sua solicitação de coleta foi enviada com sucesso!",
      );
      setForm({
        nome: "",
        telefone: "",
        email: "",
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        dataSugerida: "",
      });
      setMateriais([]);

      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err: any) {
      setErrosApiGeral(err.message || "Erro no envio.");
    } finally {
      setCarregando(false);
    }
  };

  const listaMateriais = ["Plástico", "Papel", "Vidro", "Metal", "Eletrônicos"];
  const linhaDuplaStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    width: "100%",
  };

  return (
    <section
      style={{
        maxWidth: "600px",
        width: "100%",
        boxSizing: "border-box",
        margin: "15px auto",
        padding: "20px 25px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      {mensagemSucesso && (
        <ModalProtocolo
          mensagem={mensagemSucesso}
          onClose={() => setMensagemSucesso(null)}
        />
      )}

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#2c3e50", fontSize: "26px", marginBottom: "5px" }}>
          Solicitar Coleta
        </h2>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Preencha os dados abaixo para sugerirmos a recolha.
        </p>
      </div>

      {errosApiGeral && (
        <div
          style={{
            padding: "12px 15px",
            marginBottom: "15px",
            borderRadius: "8px",
            background: "#ffebee",
            color: "#c62828",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {errosApiGeral}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <InputForm
          label="Nome Completo *"
          placeholder="Ex: João da Silva"
          value={form.nome}
          onChange={(e: any) => atualizar("nome", e.target.value)}
          error={erros.nomeCompleto}
        />

        <div style={linhaDuplaStyle}>
          <InputForm
            label="Telefone / WhatsApp *"
            placeholder="Ex: 11988887777"
            maxLength={11}
            value={form.telefone}
            onChange={(e: any) =>
              atualizar("telefone", apenasNum(e.target.value))
            }
            error={erros.telefone}
          />
          <InputForm
            label="E-mail *"
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e: any) => atualizar("email", e.target.value)}
            error={erros.email}
          />
        </div>

        <div style={linhaDuplaStyle}>
          <InputForm
            label={`CEP * ${buscandoCep ? "(Buscando...)" : ""}`}
            maxLength={8}
            placeholder="8 dígitos"
            value={form.cep}
            onChange={(e: any) => atualizar("cep", apenasNum(e.target.value))}
            onBlur={handleCepBlur}
            error={erros.cep}
          />
          <InputForm
            label="Número *"
            placeholder="Ex: 123"
            value={form.numero}
            onChange={(e: any) =>
              atualizar("numero", apenasNum(e.target.value))
            }
            error={erros.numero}
          />
        </div>

        <InputForm
          label="Logradouro *"
          placeholder="Preenchido pelo CEP"
          value={form.logradouro}
          disabled
          error={erros.logradouro}
        />

        <div style={linhaDuplaStyle}>
          <InputForm
            label="Bairro *"
            placeholder="Preenchido pelo CEP"
            value={form.bairro}
            disabled
            error={erros.bairro}
          />
          <InputForm
            label="Cidade *"
            placeholder="Preenchido pelo CEP"
            value={form.cidade}
            disabled
            error={erros.cidade}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              color: "#333",
              fontSize: "13px",
            }}
          >
            Materiais para Coleta *
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              background: "#f8f9fa",
              padding: "12px",
              borderRadius: "6px",
              border: `1px solid ${erros.materiais ? "#e74c3c" : "#eee"}`,
              boxSizing: "border-box",
            }}
          >
            {listaMateriais.map((mat) => (
              <label
                key={mat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                <input
                  type="checkbox"
                  checked={materiais.includes(mat)}
                  onChange={() =>
                    setMateriais(
                      materiais.includes(mat)
                        ? materiais.filter((m) => m !== mat)
                        : [...materiais, mat],
                    )
                  }
                />
                {mat}
              </label>
            ))}
          </div>
          {erros.materiais && (
            <span
              style={{
                color: "#e74c3c",
                fontSize: "12px",
                marginTop: "3px",
                display: "block",
              }}
            >
              {erros.materiais}
            </span>
          )}
        </div>

        <div>
          <InputForm
            label="Data Desejada para Coleta *"
            type="date"
            min={calcularDataMinimaUteis()}
            value={form.dataSugerida}
            onChange={(e: any) => atualizar("dataSugerida", e.target.value)}
            error={erros.dataSugerida}
          />
          <span
            style={{
              fontSize: "11px",
              color: "#666",
              display: "block",
              marginTop: "4px",
            }}
          >
            Data Sugerida (Mínimo 2 dias úteis) <br></br>Sujeito à avaliação de
            rota e confirmação prévia da equipe.
          </span>
        </div>

        <ButtonForm carregando={carregando} />
      </form>
    </section>
  );
}
