import React from "react";

type ButtonFormProps = {
  carregando: boolean;
  textoNormal?: string;
  textoCarregando?: string;
};

export function ButtonForm({
  carregando,
  textoNormal = "Enviar Solicitação de Coleta",
  textoCarregando = "Enviando...",
}: ButtonFormProps) {
  return (
    <button
      type="submit"
      disabled={carregando}
      style={{
        marginTop: "8px",
        width: "100%",
        padding: "12px",
        backgroundColor: carregando ? "#95a5a6" : "#27ae60",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "15px",
        fontWeight: "bold",
        cursor: carregando ? "not-allowed" : "pointer",
        boxSizing: "border-box",
        transition: "background-color 0.2s",
      }}
    >
      {carregando ? textoCarregando : textoNormal}
    </button>
  );
}
