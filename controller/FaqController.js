const Faq = require("../models/Faq");

// Create a new FAQ
const addFaqs = async (req, res) => {
  // console.log("faqqqqqqq" + JSON.stringify(req.body, null, 2));
  try {
    const { question, answer } = req.body;
    const faq = await Faq.create({ question, answer });

    res.status(200).send({
      message: "Faqs Added Successfully!",
      data: faq,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};
 
// Get all FAQs
 const getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.findAll();
    res.send(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// // Get FAQ by ID
const getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// // Update FAQ by ID
const updateFaqById =  async (req, res) => {
  try {
    const { question, answer } = req.body;
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    await faq.update({ question, answer });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// // Delete FAQ by ID
const deleteFaq =  async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    await faq.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  addFaqs,
  getAllFaqs,
  getFaqById,
  updateFaqById,
  deleteFaq
};
