import signinController from "../controllers/signin";
import signupController from "../controllers/signup";
import express,{Router } from "express";

const router: Router = express.Router();

router.post('/signup',signupController);
router.post('/signin',signinController);

module.exports = router;