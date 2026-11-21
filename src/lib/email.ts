import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DadosEmailConfirmacao {
  para: string;
  nomeCompleto: string;
  protocolo: string;
  dataSugerida: string;
  materiais: string[];
}

export async function enviarEmailConfirmacao({
  para,
  nomeCompleto,
  protocolo,
  dataSugerida,
  materiais,
}: DadosEmailConfirmacao) {
  const dataFormatada = dataSugerida
    ? dataSugerida.split("-").reverse().join("/")
    : "A definir";

  return await resend.emails.send({
    from: "Colete Aqui <onboarding@resend.dev>",
    to: para,
    subject: `Protocolo ${protocolo} - Solicitação de Coleta Recebida`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e1e8ed; border-radius: 8px;">
        <h2 style="color: #27ae60; margin-top: 0;">Solicitação Registrada!</h2>
        <p>Olá, <strong>${nomeCompleto}</strong>,</p>
        <p>Recebemos o seu pedido de coleta seletiva. Guarde o código abaixo para acompanhar ou gerenciar sua solicitação:</p>
        
        <div style="background-color: #f4f6f8; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <span style="font-size: 12px; text-transform: uppercase; color: #666; display: block; margin-bottom: 4px;">Seu Protocolo</span>
          <strong style="font-size: 24px; color: #2c3e50; font-family: monospace; letter-spacing: 1px;">${protocolo}</strong>
        </div>

        <p style="margin: 6px 0;"><strong>Data sugerida:</strong> ${dataFormatada}</p>
        <p style="margin: 6px 0;"><strong>Materiais:</strong> ${materiais.join(", ")}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #888; margin-bottom: 0;">
          A data escolhida é uma preferência e passará pela validação logística da nossa equipe.
        </p>
      </div>
    `,
  });
}
