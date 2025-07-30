const express = require('express');
const router = express.Router();
const { addSubscription, getAllSubscriptions, deleteSubscription, updateSubscriptionStatus } = require('../controller/subscriptionController');


router.post('/add', addSubscription);
router.get('/all', getAllSubscriptions);
router.put("/status/:id", updateSubscriptionStatus);  
router.delete("/delete/:id", deleteSubscription);  

module.exports = router;
