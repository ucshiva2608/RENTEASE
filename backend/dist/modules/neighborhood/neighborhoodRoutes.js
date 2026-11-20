"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const neighborhoodController_1 = require("./neighborhoodController");
const router = (0, express_1.Router)();
router.get('/:propertyId', neighborhoodController_1.NeighborhoodController.getNeighborhoodInfo);
exports.default = router;
