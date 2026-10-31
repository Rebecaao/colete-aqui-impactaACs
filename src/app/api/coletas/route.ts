import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const protocolo = searchParams.get("protocolo");
    const email = searchParams.get("email");
    const statusFiltro = searchParams.get("status");

    if (protocolo) {
      const docRef = doc(db, "agendamentos", protocolo.trim().toUpperCase());
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json(
          {
            sucesso: false,
            mensagem: "Nenhuma solicitação encontrada com este protocolo.",
          },
          { status: 404 },
        );
      }

      const dadosDoc = docSnap.data();
      const coletaFormatada = {
        protocolo: dadosDoc.protocolo,
        nomeCompleto: dadosDoc.nomeCompleto,
        telefone: dadosDoc.telefone,
        email: dadosDoc.email,
        endereco: {
          logradouro: dadosDoc.logradouro,
          numero: dadosDoc.numero,
          bairro: dadosDoc.bairro,
          cidade: dadosDoc.cidade,
        },
        materiais: dadosDoc.materiais,
        dataSugerida: dadosDoc.dataSugerida,
        status: dadosDoc.status,
        motivoCancelamento: dadosDoc.motivoCancelamento || null,
        canceladoEm: dadosDoc.canceladoEm || null,
        criadoEm: dadosDoc.criadoEm,
      };

      return NextResponse.json(
        { sucesso: true, coleta: coletaFormatada },
        { status: 200 },
      );
    }

    if (email) {
      let q = query(
        collection(db, "agendamentos"),
        where("email", "==", email.trim().toLowerCase()),
      );

      if (statusFiltro && statusFiltro !== "TODOS") {
        q = query(q, where("status", "==", statusFiltro));
      }

      const querySnapshot = await getDocs(q);

      const coletas: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const dadosDoc = docSnap.data();
        coletas.push({
          protocolo: dadosDoc.protocolo,
          nomeCompleto: dadosDoc.nomeCompleto,
          telefone: dadosDoc.telefone,
          email: dadosDoc.email,
          endereco: {
            logradouro: dadosDoc.logradouro,
            numero: dadosDoc.numero,
            bairro: dadosDoc.bairro,
            cidade: dadosDoc.cidade,
          },
          materiais: dadosDoc.materiais,
          dataSugerida: dadosDoc.dataSugerida,
          status: dadosDoc.status,
          motivoCancelamento: dadosDoc.motivoCancelamento || null,
          canceladoEm: dadosDoc.canceladoEm || null,
          criadoEm: dadosDoc.criadoEm,
        });
      });

      return NextResponse.json({ sucesso: true, coletas }, { status: 200 });
    }

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Informe um protocolo ou e-mail para realizar a consulta.",
      },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Erro na rota GET /api/coletas:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro interno do servidor ao consultar solicitações.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nomeCompleto, telefone, email, endereco, materiais, dataSugerida } =
      body;

    if (!nomeCompleto || !email || !materiais || materiais.length === 0) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Preencha todos os campos obrigatórios." },
        { status: 400 },
      );
    }

    const protocolo = `CEL-${Math.floor(100000 + Math.random() * 900000)}`;

    const novaColeta = {
      protocolo,
      nomeCompleto: nomeCompleto.trim(),
      telefone: telefone || "",
      email: email.trim().toLowerCase(),
      logradouro: endereco?.logradouro || "",
      numero: endereco?.numero || "",
      bairro: endereco?.bairro || "",
      cidade: endereco?.cidade || "",
      materiais,
      dataSugerida: dataSugerida || "",
      status: "Pendente",
      motivoCancelamento: null,
      canceladoEm: null,
      criadoEm: new Date().toISOString(),
    };

    const docRef = doc(db, "agendamentos", protocolo);
    await setDoc(docRef, novaColeta);

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Solicitação criada com sucesso!",
        protocolo,
        coleta: novaColeta,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Erro na rota POST /api/coletas:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno ao salvar a solicitação." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { protocolo, motivoCancelamento } = body;

    if (!protocolo) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Protocolo não informado." },
        { status: 400 },
      );
    }

    if (!motivoCancelamento || motivoCancelamento.trim().length < 5) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O motivo do cancelamento deve ter pelo menos 5 caracteres.",
        },
        { status: 400 },
      );
    }

    const docRef = doc(db, "agendamentos", protocolo.trim().toUpperCase());
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { sucesso: false, mensagem: "Solicitação não encontrada." },
        { status: 404 },
      );
    }

    await updateDoc(docRef, {
      status: "Cancelado",
      motivoCancelamento: motivoCancelamento.trim(),
      canceladoEm: new Date().toISOString(),
    });

    return NextResponse.json(
      { sucesso: true, mensagem: "Solicitação cancelada com sucesso!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Erro na rota PATCH /api/coletas:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro interno do servidor ao cancelar solicitação.",
      },
      { status: 500 },
    );
  }
}
