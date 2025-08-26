import { endOfDay, startOfDay, addDays } from "date-fns";

/**
 * @func handleQuery
 * Função para tratar a query, criando os filtros, ordenação e pagina
 * Valor padrão da pagina é 1 quando não informada na query
 * @param {object} query
 * @param {object} defaultSort - Ordenação padrão caso o usuario não informe na query
 * @returns {object} a query tratada com os filtros, ordenação e pagina
 */
export default function (query, defaultSort) {
  const filtros = {};
  let pagina = 1;
  let ordenar = defaultSort;

  for(const [key, value] of Object.entries(query)) {
    if(key === "pagina") {
      pagina = parseInt(value);
      continue;
    }
    if(key === "ordenar") {
      const sort = value.split("-");
      ordenar = { [sort[0]]: sort[1] };
      continue;
    }
    //Campo do usuario
    if(key === "ativo") {
      filtros[key] = value === "1";
      continue;
    }
    //Campo do usuario e do projeto
    if (key === "turnos") {
      const turnos = value.split(",");
      for (const turno of turnos) {
        filtros[`turnos.${turno}`] = true;
      }
      continue;
    }
    // Campo do projeto
    if (key === "estudantes") {
      const estudantes = value.split(",");
      filtros[key] = { $elemMatch: { $in: estudantes } };
      continue;
    }

    // Depois verificar se essa é uma boa maneira de filtrar datas ou é melhor nem ter.
    // Inicio e termino é campo do projeto e do estagio, e o liberado e do refeicaoTurma
    if (key === "data_inicio" || key === "data_termino" || key === "data_liberado") {
      const datas = value.split(",");
      filtros[key] = {
        // Depois vê se é possível refatorar isso e deixar melhor, mexer com datas é uma #####
        $gte: startOfDay(addDays(datas[0], 1)),
        $lte: endOfDay(addDays(datas[1], 1)),
      };
      continue;
    }

    // // Campos do refeicao
    // if(key === "dataInicio" || key === "dataTermino"){
    //   const data = value;
    //   filtros[key] = {
    //     $gte: startOfDay(addDays(data, 1)),
    //     $lte: endOfDay(addDays(data, 1)),
    //   }
    //   continue;
    // }

    //Campo do estudante e da turma
    if (key === "turma" || key === "curso") {
      filtros[key] = value;
      continue;
    }
    //O resto é tratado com filtro
    if(value) {
      filtros[key] = { $regex: new RegExp(value, "i") };
    }
  }

  return { filtros, pagina, ordenar };
}
