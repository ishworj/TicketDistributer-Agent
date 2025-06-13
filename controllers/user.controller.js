import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import user from "../models/user";
import { inngest } from "../inngest/client.js";
import user from "../models/user";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;
  try {
    const hashed = bcrypt.hash(password, 10);
    const user = await user.create({ email, password: hashed, skills });

    // fire inngest event

    await inngest.send({
      name: "user/signup",
      data: { email },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({
      error: "Signup failled",
      details: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = user.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User nor found" });
    }
    const isMatched = bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(401).json({ error: "Invalid Credintials" });
    }
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({
      error: "Signin failled",
      details: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      res.json({ message: "Logout successfully" });
    });
  } catch (error) {
    res.status(500).json({
      error: "Login failled",
      details: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await user.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    await user.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );

    return res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: "updated failled",
      details: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const users = await user.find().select("-password");
    return res.josn(users);
  } catch (error) {
    res.status(500).json({
      error: "getusers failled",
      details: error.message,
    });
  }
};
