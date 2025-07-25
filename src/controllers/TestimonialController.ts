import { Request, Response } from 'express';
import { Testimonial, User } from '../models';

export class TestimonialController {
  // Get all testimonials
  static async index(req: Request, res: Response) {
    try {
      console.log(req);
      const testimonials = await Testimonial.findAll({
        include: [{ model: User, as: 'user' }],
        order: [['createdAt', 'DESC']],
      });
      return res.json({ success: true, data: { testimonials } });
    } catch (error) {
      console.error('Testimonial index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get testimonial by ID
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const testimonial = await Testimonial.findOne({
        where: { id },
        include: [{ model: User, as: 'user' }],
      });
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      return res.json({ success: true, data: { testimonial } });
    } catch (error) {
      console.error('Testimonial show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Create testimonial
  static async create(req: Request, res: Response) {
    try {
      console.log(req);
      const userId = 123;
      const { user_name, text, img_url, site_url, ratings } = req.body;
      const testimonial = await Testimonial.create({ 
        user_id: userId, 
        user_name, 
        text, 
        img_url, 
        site_url, 
        ratings 
      });
      return res.status(201).json({ success: true, data: { testimonial } });
    } catch (error) {
      console.error('Testimonial create error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete testimonial
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const testimonial = await Testimonial.findOne({ where: { id } });
      if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
      await testimonial.destroy();
      return res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
      console.error('Testimonial destroy error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get approved testimonials
  static async getApproved(req: Request, res: Response) {
    try {
      console.log(req);
      const testimonials = await Testimonial.findAll({
        include: [{ model: User, as: 'user' }],
        order: [['createdAt', 'DESC']],
      });
      return res.json({ success: true, data: { testimonials } });
    } catch (error) {
      console.error('Testimonial getApproved error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get testimonial list (matching PHP FaqController.FaqList structure)
  public static async TestimonialList(_req: Request, res: Response) {
    try {
      const testimonials = await Testimonial.findAll({
        order: [['createdAt', 'DESC']],
      });

      if (testimonials.length === 0) {
        return res.status(200).json({ error: 'No data found' });
      }

      // Format testimonials to match the expected JSON structure
      const formattedTestimonials = testimonials.map((testimonial: any) => {
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
    } catch (error) {
      console.error('Testimonial list error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 