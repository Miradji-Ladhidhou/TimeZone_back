const { Conge, DatesBloquees } = require('../models');
const { Op } = require('sequelize');

async function getCongesAlertes(utilisateurId = null) {
  const whereClause = utilisateurId ? { utilisateur_id: utilisateurId } : {};

  const conges = await Conge.findAll({ where: whereClause, raw: true });

  const alertes = await Promise.all(conges.map(async (c) => {
    // Chevauchement avec d'autres congés du même utilisateur
    const chevauchement_conges = await Conge.count({
      where: {
        utilisateur_id: c.utilisateur_id,
        id: { [Op.ne]: c.id },
        date_debut: { [Op.lte]: c.date_fin },
        date_fin: { [Op.gte]: c.date_debut }
      }
    }) > 0;

    // Chevauchement avec dates bloquées de l'entreprise
    const chevauchement_dates_bloquees = await DatesBloquees.count({
      where: {
        entreprise_id: c.entreprise_id,
        date_debut: { [Op.lte]: c.date_fin },
        date_fin: { [Op.gte]: c.date_debut }
      }
    }) > 0;

    return {
      ...c,
      chevauchement_conges,
      chevauchement_dates_bloquees
    };
  }));

  return alertes;
}

module.exports = { getCongesAlertes };
