"use client";

import React from "react";

type ModalProtocoloProps = {
  protocolo: string;
  mensagem: string;
  onClose: () => void;
};

export function ModalProtocolo({
  protocolo,
  mensagem,
  onClose,
}: ModalProtocoloProps) {
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
          style={{
            color: "#2c3e50",
            margin: "0 0 10px 0",
            fontSize: "22px",
            textAlign: "center",
          }}
        >
          Solicitação registrada com sucesso!
        </h3>

        <p
          style={{
            color: "#555",
            fontSize: "14px",
            margin: "0 0 15px 0",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          <strong>anote o seu número de protocolo</strong>
        </p>

        <div
          style={{
            backgroundColor: "#f4f6f7",
            border: "2px dashed #27ae60",
            borderRadius: "8px",
            padding: "16px",
            margin: "15px 0",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#666",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Número do Protocolo:
          </span>
          <strong
            style={{
              fontSize: "20px",
              color: "#27ae60",
              fontFamily: "monospace",
            }}
          >
            {protocolo}
          </strong>
        </div>

        <p
          style={{
            color: "#444",
            fontSize: "14px",
            margin: "0 0 20px 0",
            lineHeight: "1.6",
          }}
        >
          Por favor, guarde esse protocolo para acompanhar sua solicitação.
          Entraremos em contato em breve.
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
