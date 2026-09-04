"use client";

import React, { useState } from "react";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { SolicitarSection } from "@/src/components/Form";

type Pagina = "inicio" | "solicitar";

export default function Home() {
  const [paginaAtual, setPaginaAtual] = useState<Pagina>("inicio");

  return (
    <div className="page-wrapper">
      <Header
        paginaAtual={paginaAtual}
        setPaginaAtual={(p) => setPaginaAtual(p as Pagina)}
      />

      <main className="container">
        {/* ABA INÍCIO */}
        {paginaAtual === "inicio" && (
          <>
            <section className="hero">
              <h2>Reciclagem ficou mais fácil</h2>
              <p>
                Solicite a coleta de materiais recicláveis diretamente da sua
                residência.
              </p>

              <div>
                <button
                  className="btn"
                  onClick={() => setPaginaAtual("solicitar")}
                >
                  Solicitar Coleta
                </button>
              </div>
            </section>

            <section>
              <h2>Como funciona?</h2>
              <div className="passos">
                <div className="card">
                  <h3>1. Solicite</h3>
                  <p>Informe seus dados e os materiais que quer reciclar.</p>
                </div>
                <div className="card">
                  <h3>2. Agende</h3>
                  <p>Escolha o dia ideal para a realização da coleta.</p>
                </div>
                <div className="card">
                  <h3>3. Recicle</h3>
                  <p>Separe tudo e aguarde a equipe no dia marcado.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ABA SOLICITAR */}
        {paginaAtual === "solicitar" && <SolicitarSection />}
      </main>

      <Footer />
    </div>
  );
}
