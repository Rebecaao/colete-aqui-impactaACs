import React from "react";

type ModalProtocoloProps = {
  mensagem: string;
  onClose: () => void;
};

export function ModalProtocolo({ mensagem, onClose }: ModalProtocoloProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "450px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <h3
          style={{ color: "#2c3e50", margin: "0 0 10px 0", fontSize: "22px" }}
        >
          Tudo Pronto!
        </h3>

        <p
          style={{
            color: "#444",
            fontSize: "14px",
            margin: "0 0 20px 0",
            lineHeight: "1.5",
          }}
        >
          <strong style={{ color: "#27ae60" }}>{mensagem}</strong>
          <br />
          <br />
          Fique de olho em seu telefone e e-mail informados. Entraremos em
          contato em breve para confirmar a viabilidade da data sugerida.
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
