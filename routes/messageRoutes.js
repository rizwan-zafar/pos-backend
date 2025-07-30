const express = require('express');
const { createMessage, getAllMessages, updateMessageStatus, deleteMessage } = require('../controller/Message');
const router = express.Router();


router.post('/add', createMessage);
router.get('/all', getAllMessages);
router.put("/status/:id", updateMessageStatus);  
router.delete("/delete/:id", deleteMessage);  

module.exports = router;
