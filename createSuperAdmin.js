const { Utilisateur, Entreprise } = require('./models');
const bcrypt = require('bcrypt');

async function createSuperAdmin() {
  try {
    // Vérifie si l'entreprise existe déjà
    const [systemEntreprise] = await Entreprise.findOrCreate({
      where: { nom: 'TimeZone' },
      defaults: { nom: 'TimeZone' }
    });

    // Vérifie si un super_admin existe déjà
    const existingAdmin = await Utilisateur.findOne({ where: { role: 'super_admin' } });
    if (existingAdmin) {
      console.log('Un super_admin existe déjà :', existingAdmin.email);
      process.exit(0);
    }

    const password = 'AZERTYUIOP'; // mot de passe clair
    const passwordHash = await bcrypt.hash(password, 10);

    const superAdmin = await Utilisateur.create({
      nom: 'Admin',
      prenom: 'Super',
      email: 'superadmin@example.com',
      mot_de_passe: passwordHash,
      role: 'super_admin',
      actif: true,
      date_embauche: new Date(),
      entrepriseId: systemEntreprise.id
    });

    console.log(' Super admin créé avec succès :');
    console.log('   Email :', superAdmin.email);
    console.log('   Mot de passe :', password);
    process.exit(0);
  } catch (err) {
    console.error(' Erreur création super admin :', err);
    process.exit(1);
  }
}

createSuperAdmin();
