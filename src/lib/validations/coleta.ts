export function eDataValidaComDiasUteis(dataString: string): boolean {
  const dataSelecionada = new Date(`${dataString}T00:00:00`);
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);
  dataSelecionada.setHours(0, 0, 0, 0);

  let diasUteisContados = 0;
  let dataCursor = new Date(hoje);

  while (diasUteisContados < 2) {
    dataCursor.setDate(dataCursor.getDate() + 1);
    const diaDaSemana = dataCursor.getDay();

    if (diaDaSemana !== 0 && diaDaSemana !== 6) {
      diasUteisContados++;
    }
  }

  return dataSelecionada >= dataCursor;
}
