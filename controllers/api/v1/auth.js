const jwt = require("jsonwebtoken");
const User = require("../../../models/api/v1/User");
const nodemailer = require("nodemailer");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role,
      activeUnactive,
      country, // Nieuwe velden
      city, // Nieuwe velden
      postalCode, // Nieuwe velden
      profileImage, // Nieuwe velden
      bio, // Nieuwe velden
    } = req.body.user;

    // Validatie voor ontbrekende velden
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !role ||
      !activeUnactive
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Controleer of e-mail al bestaat
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Maak een nieuwe gebruiker
    const user = new User({
      firstname,
      lastname,
      email,
      role,
      activeUnactive,
      country, // Nieuwe velden
      city, // Nieuwe velden
      postalCode, // Nieuwe velden
      profileImage, // Nieuwe velden
      bio, // Nieuwe velden
    });

    // Gebruik de register-methode van passport-local-mongoose om het wachtwoord te hashen
    await User.register(user, password);

    const token = jwt.sign(
      {
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
      "MyVerySecretWord", // Geheime sleutel
      { expiresIn: "1h" } // Token vervalt na 1 uur
    );

    res.status(201).json({
      status: "success",
      data: {
        token: token,
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          id: user._id,
          role: user.role,
          activeUnactive: user.activeUnactive,
          country: user.country, // Nieuwe velden
          city: user.city, // Nieuwe velden
          postalCode: user.postalCode, // Nieuwe velden
          profileImage: user.profileImage, // Nieuwe velden
          bio: user.bio, // Nieuwe velden
        },
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ message: "An error occurred during signup. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Email and password are required",
      });
    }

    // Authenticate user
    const authResult = await User.authenticate()(email, password);
    const user = authResult.user; // Haal de user uit authResult

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
      "MyVerySecretWord",
      { expiresIn: "1h" }
    );

    return res.json({
      status: "success",
      data: {
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during login. Please try again.",
    });
  }
};

const index = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      status: "success",
      data: {
        users: users,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve users",
      error: err.message || err,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params; // Haal de ID uit de requestparameters

    const user = await User.findById(id); // Zoek de gebruiker op basis van de ID

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      status: "success",
      data: {
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          id: user._id,
          role: user.role,
          activeUnactive: user.activeUnactive,
          country: user.country, // Voeg het nieuwe veld toe
          city: user.city, // Voeg het nieuwe veld toe
          postalCode: user.postalCode, // Voeg het nieuwe veld toe
          profileImage: user.profileImage, // Voeg het nieuwe veld toe
          bio: user.bio, // Voeg het nieuwe veld toe
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "An error occurred while fetching user.",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  const userData = req.body.user;
  const { id } = req.params;

  if (!userData) {
    return res.status(400).json({
      status: "error",
      message: "User data is required for update",
    });
  }

  try {
    const updatedUser = await User.findById(id);

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const { oldPassword, newPassword } = userData;

    // Controleer of er een nieuw wachtwoord is opgegeven
    if (newPassword) {
      // Als er een nieuw wachtwoord is opgegeven, controleer dan het oude wachtwoord
      if (!oldPassword) {
        return res.status(400).json({
          status: "error",
          message: "Old password is required to change the password",
        });
      }

      // Controleer of het oude wachtwoord overeenkomt
      const isMatch = await updatedUser.isValidPassword(oldPassword);

      // Als het oude wachtwoord onjuist is, geef dan een foutstatus terug
      if (!isMatch.user) {
        return res.status(401).json({
          status: "error",
          message: "Old password is incorrect",
        });
      }

      // Stel het nieuwe wachtwoord in
      await updatedUser.setPassword(newPassword);
    }

    // Update andere gebruikersgegevens indien nodig
    Object.assign(updatedUser, userData);

    // Sla de wijzigingen op
    await updatedUser.save();

    res.json({
      status: "success",
      data: {
        user: {
          firstname: updatedUser.firstname,
          lastname: updatedUser.lastname,
          email: updatedUser.email,
          id: updatedUser._id,
          role: updatedUser.role,
          activeUnactive: updatedUser.activeUnactive,
          country: updatedUser.country,
          city: updatedUser.city,
          postalCode: updatedUser.postalCode,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
        },
      },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: "error",
      message: "User could not be updated",
      error: err.message || err,
    });
  }
};

const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Controleer of de gebruiker met het gegeven e-mailadres bestaat
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hier kun je een token genereren
    const token = jwt.sign(
      {
        userId: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
      "MyVerySecretWord",
      { expiresIn: "1h" }
    );

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp-auth.mailprotect.be",
      port: 587, // of 465 voor SSL
      secure: false, // true voor 465, false voor andere poorten
      auth: {
        user: process.env.COMBELL_EMAIL, // je volledige e-mailadres
        pass: process.env.COMBELL_PASSWORD, // je e-mailwachtwoord
      },
    });

    const resetLink = `http://yourdomain.com/reset-password/${token}`;

    const mailOptions = {
      from: process.env.COMBELL_EMAIL,
      to: user.email, // Stuur de e-mail naar de gebruiker
      subject: "Wachtwoord reset",
      text: `Klik op de volgende link om je wachtwoord opnieuw in te stellen: ${resetLink}`,
    };

    console.log("Email:", process.env.COMBELL_EMAIL);
    console.log("Password:", process.env.COMBELL_PASSWORD);

    // Verstuur de e-mail met await
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  destroy,
  index,
  update,
  show,
  forgotPassword,
};
