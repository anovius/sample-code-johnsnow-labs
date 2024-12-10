import spaceController from "@controllers/space.controller";
import auth from "@middlewares/auth";
import { Router } from "express";
const router = Router();

router.post( '/create', auth.required, spaceController.create )
router.get( '/get/roles/:space', auth.required, spaceController.getSpaceRoles )
router.post( '/assign/role', auth.required, spaceController.assignSpaceRoles )
router.post( '/default/role', auth.required, spaceController.setDefaultSpaceRole )

export default router;