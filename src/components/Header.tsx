import React from "react";

type HeaderProps = {
  paginaAtual: string;
  setPaginaAtual: (pagina: string) => void;
};

export default function Header({ paginaAtual, setPaginaAtual }: HeaderProps) {
  return (
    <header className="header">
      <h1>Colete Aqui</h1>
      <nav className="nav">
        <button
          onClick={() => setPaginaAtual("inicio")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontWeight: paginaAtual === "inicio" ? "bold" : "normal",
            marginLeft: "15px",
            fontSize: "16px",
          }}
        >
          Início
        </button>
        <button
          onClick={() => setPaginaAtual("solicitar")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontWeight: paginaAtual === "solicitar" ? "bold" : "normal",
            marginLeft: "15px",
            fontSize: "16px",
          }}
        >
          Solicitar
        </button>
        <button
          onClick={() => setPaginaAtual("consultar")}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontWeight: paginaAtual === "consultar" ? "bold" : "normal",
            marginLeft: "15px",
            fontSize: "16px",
          }}
        >
          Consultar
        </button>
      </nav>
    </header>
  );
}
