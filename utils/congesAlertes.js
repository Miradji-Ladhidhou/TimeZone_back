const { Conge, DateBloquee } = require('../models');
const { Op } = require('sequelize');

async function getCongesAlertes(utilisateurId = null) {
  const whereClause = utilisateurId ? { utilisateurId } : {};

  const conges = await Conge.findAll({ where: whereClause, raw: true });

  const alertes = await Promise.all(conges.map(async (c) => {
    const chevauchement_conges = await Conge.count({
      where: {
        utilisateurId: c.utilisateurId,
        id: { [Op.ne]: c.id },
        date_debut: { [Op.lte]: c.date_fin },
        date_fin: { [Op.gte]: c.date_debut }
      }
    }) > 0;

    const chevauchement_dates_bloquees = await DateBloquee.count({
      where: {
        entrepriseId: c.entrepriseId,
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
