const FAQ = require('../models/FAQ');
const errorHandler = require('../middleware/errorHandler.js');

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ category: 1, createdAt: 1 });
    
    // Group FAQs by category
    const faqsByCategory = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        id: faq._id,
        question: faq.question,
        answer: faq.answer,
      });
      return acc;
    }, {});

    res.json({
      success: true,
      faqsByCategory,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error fetching FAQs', error);
  }
};

// Get FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq || !faq.isActive) {
      return errorHandler(res, 404, 'FAQ not found');
    }

    res.json({
      success: true,
      faq,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error fetching FAQ', error);
  }
};

// Create new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      faq,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error creating FAQ', error);
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!faq) {
      return errorHandler(res, 404, 'FAQ not found');
    }

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      faq,
    });
  } catch (error) {
    errorHandler(res, 500, 'Error updating FAQ', error);
  }
};

// Delete FAQ (soft delete)
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!faq) {
      return errorHandler(res, 404, 'FAQ not found');
    }

    res.json({
      success: true,
      message: 'FAQ deactivated successfully',
    });
  } catch (error) {
    errorHandler(res, 500, 'Error deleting FAQ', error);
  }
};