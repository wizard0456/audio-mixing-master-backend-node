"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialController = void 0;
const models_1 = require("../models");
class TestimonialController {
    static async index(req, res) {
        try {
            console.log(req);
            const testimonials = await models_1.Testimonial.findAll({
                include: [{ model: models_1.User, as: 'user' }],
                order: [['createdAt', 'DESC']],
            });
            return res.json({ success: true, data: { testimonials } });
        }
        catch (error) {
            console.error('Testimonial index error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async show(req, res) {
        try {
            const { id } = req.params;
            const testimonial = await models_1.Testimonial.findOne({
                where: { id },
                include: [{ model: models_1.User, as: 'user' }],
            });
            if (!testimonial) {
                return res.status(404).json({ message: 'Testimonial not found' });
            }
            return res.json({ success: true, data: { testimonial } });
        }
        catch (error) {
            console.error('Testimonial show error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async create(req, res) {
        try {
            console.log(req);
            const userId = 123;
            const { user_name, text, img_url, site_url, ratings } = req.body;
            const testimonial = await models_1.Testimonial.create({
                user_id: userId,
                user_name,
                text,
                img_url,
                site_url,
                ratings
            });
            return res.status(201).json({ success: true, data: { testimonial } });
        }
        catch (error) {
            console.error('Testimonial create error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async destroy(req, res) {
        try {
            const { id } = req.params;
            const testimonial = await models_1.Testimonial.findOne({ where: { id } });
            if (!testimonial) {
                return res.status(404).json({ message: 'Testimonial not found' });
            }
            await testimonial.destroy();
            return res.json({ success: true, message: 'Testimonial deleted successfully' });
        }
        catch (error) {
            console.error('Testimonial destroy error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getApproved(req, res) {
        try {
            console.log(req);
            const testimonials = await models_1.Testimonial.findAll({
                include: [{ model: models_1.User, as: 'user' }],
                order: [['createdAt', 'DESC']],
            });
            return res.json({ success: true, data: { testimonials } });
        }
        catch (error) {
            console.error('Testimonial getApproved error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async TestimonialList(_req, res) {
        try {
            const testimonials = await models_1.Testimonial.findAll({
                order: [['createdAt', 'DESC']],
            });
            if (testimonials.length === 0) {
                return res.status(200).json({ error: 'No data found' });
            }
            const formattedTestimonials = testimonials.map((testimonial) => {
                const testimonialData = testimonial.toJSON();
                return {
                    id: testimonialData.id,
                    user_id: testimonialData.user_id,
                    user_name: testimonialData.user_name,
                    text: testimonialData.text,
                    img_url: testimonialData.img_url,
                    site_url: testimonialData.site_url,
                    ratings: testimonialData.ratings,
                    created_at: testimonialData.createdAt,
                    updated_at: testimonialData.updatedAt,
                };
            });
            return res.json(formattedTestimonials);
        }
        catch (error) {
            console.error('Testimonial list error:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}
exports.TestimonialController = TestimonialController;
//# sourceMappingURL=TestimonialController.js.map