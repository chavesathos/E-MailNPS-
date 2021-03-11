import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

/**
 * Detratores => 0 à 6
 * Passivos => 7 à 8
 * Promotores => 9 à 10
 *
 * Calculo do NPS => ( N° de promotores - n° de detratores) / (n° de respondentes) x 100
 */
class NpsController {
  async execute(request: Request, response: Response) {
    const { survey_id } = request.params;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveysUsers = await surveysUsersRepository.find({
      survey_id,
      value: Not(IsNull()),                                                   
    });

    const detractor = surveysUsers.filter(
        (survey) => survey.value >= 0 && survey.value <= 6
    ).length;

    const promoters = surveysUsers.filter(
        (survey) => survey.value >= 9 && survey.value <= 10
     ).length;

     const passive = surveysUsers.filter(
         (survey) => survey.value >= 7 && survey.value <= 8
     ).length;

     const totalAnswer = surveysUsers.length;

     const calculate = Number((((promoters - detractor) / totalAnswer) * 100).toFixed(2));

     return response.json({
         detractor,
         promoters,
         passive,
         totalAnswer,
         nps: calculate,
     })
  }
}

export { NpsController };
