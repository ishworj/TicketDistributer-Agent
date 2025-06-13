import { getUsers, login, logout, signup, updateUser } from "../controllers/user.controller.js"
import express from express
import { authenticate } from "../middlewares/auth"

const router = express.Router()

router.post("/update-user",authenticate,updateUser)
router.post("/users",authenticate,getUsers)

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
export default router