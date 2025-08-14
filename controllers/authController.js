const Utilisateur = require("../models/Utilisateur");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = async (req, res) => {
  const { email, mot_de_passe } = req.body;
  try {
    const user = await Utilisateur.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, entrepriseId: user.entrepriseId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
