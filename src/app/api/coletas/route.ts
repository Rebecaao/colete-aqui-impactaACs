import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { z } from "zod";

const coletaSchema = z.object({
  nomeCompleto: z
    .string()
    .min(3, "O nome completo é obrigatório e deve ter ao menos 3 caracteres."),

  telefone: z
    .string()
    .regex(
      /^\d{10,11}$/,
      "Telefone inválido. Deve conter 10 ou 11 dígitos (com DDD, apenas números).",
    ),

  email: z.string().email("E-mail inválido. O e-mail é obrigatório."),
  endereco: z.object({
    cep: z
      .string()
      .regex(
        /^\d{8}$/,
        "CEP inválido. Deve conter exatamente 8 dígitos numéricos.",
      ),
    logradouro: z.string().min(2, "Logradouro é obrigatório."),
    numero: z.string().min(1, "Número é obrigatório."),
    bairro: z
      .string()
      .min(2, "Bairro é obrigatório.")
      .refine(
        (val) => !/^\d+$/.test(val),
        "O bairro não pode conter apenas números.",
      ),
    cidade: z.string().min(2, "Cidade é obrigatória."),
  }),
  materiais: z
    .array(z.string())
    .min(1, "Selecione ao menos um material para coleta."),
  dataSugerida: z.string().refine((dataStr) => {
    const dataSelecionada = new Date(dataStr + "T00:00:00");
    if (isNaN(dataSelecionada.getTime())) return false;

    let diasUteisAdicionados = 0;
    const dataMinima = new Date();
    dataMinima.setHours(0, 0, 0, 0);

    while (diasUteisAdicionados < 2) {
      dataMinima.setDate(dataMinima.getDate() + 1);
      const diaDaSemana = dataMinima.getDay();
      if (diaDaSemana !== 0 && diaDaSemana !== 6) {
        diasUteisAdicionados++;
      }
    }

    return dataSelecionada >= dataMinima;
  }, "A data sugerida deve ser de no mínimo 2 dias úteis a partir de hoje."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("--- CORPO RECEBIDO NA API ---", JSON.stringify(body, null, 2));

    const resultadoValidacao = coletaSchema.safeParse(body);

    if (!resultadoValidacao.success) {
      console.log(
        "--- FALHOU NA VALIDAÇÃO DO ZOD ---",
        resultadoValidacao.error.format(),
      );
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Os dados fornecidos inválidos.",
          erros: resultadoValidacao.error.format(),
        },
        { status: 400 },
      );
    }

    console.log("--- PASSOU NA VALIDAÇÃO --- Salvando no Firestore...");
    const dadosValidos = resultadoValidacao.data;
    const protocolo = `REC-${Date.now().toString(36).toUpperCase()}`;

    const dadosParaSalvar = {
      protocolo,
      nomeCompleto: dadosValidos.nomeCompleto,
      telefone: dadosValidos.telefone,
      email: dadosValidos.email || "",
      logradouro: dadosValidos.endereco.logradouro,
      numero: dadosValidos.endereco.numero,
      bairro: dadosValidos.endereco.bairro,
      cidade: dadosValidos.endereco.cidade,
      materiais: dadosValidos.materiais,
      dataSugerida: dadosValidos.dataSugerida,
      status: "Pendente",
      criadoEm: new Date().toISOString(),
    };

    const docRef = doc(db, "agendamentos", protocolo);
    await setDoc(docRef, dadosParaSalvar);

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Solicitação de coleta registrada com sucesso!",
        protocolo,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("ERRO CRÍTICO NA ROTA:", error);
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro interno no servidor.",
        detalhe: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const protocolo = searchParams.get("protocolo");

    if (!protocolo) {
      return NextResponse.json(
        { status: "online", mensagem: "Rota de solicitações ativa." },
        { status: 200 },
      );
    }

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
      criadoEm: dadosDoc.criadoEm,
    };

    return NextResponse.json(
      { sucesso: true, coleta: coletaFormatada },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Erro ao buscar no Firestore:", error);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro interno ao buscar a solicitação." },
      { status: 500 },
    );
  }
}

// export async function PATCH(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { protocolo } = body;

//     if (!protocolo) {
//       return NextResponse.json(
//         { sucesso: false, mensagem: "Protocolo não informado." },
//         { status: 400 },
//       );
//     }

//     const docRef = doc(db, "agendamentos", protocolo.trim().toUpperCase());
//     const docSnap = await getDoc(docRef);

//     if (!docSnap.exists()) {
//       return NextResponse.json(
//         { sucesso: false, mensagem: "Solicitação não encontrada." },
//         { status: 404 },
//       );
//     }

//     const dadosAtuais = docSnap.data();

//     if (dadosAtuais.status === "Cancelado") {
//       return NextResponse.json(
//         {
//           sucesso: false,
//           mensagem: "Esta solicitação já se encontra cancelada.",
//         },
//         { status: 400 },
//       );
//     }

//     await updateDoc(docRef, { status: "Cancelado" });

//     return NextResponse.json(
//       { sucesso: true, mensagem: "Solicitação cancelada com sucesso." },
//       { status: 200 },
//     );
//   } catch (error: any) {
//     console.error("Erro ao cancelar solicitação:", error);
//     return NextResponse.json(
//       { sucesso: false, mensagem: "Erro interno ao cancelar a solicitação." },
//       { status: 500 },
//     );
//   }
// }
