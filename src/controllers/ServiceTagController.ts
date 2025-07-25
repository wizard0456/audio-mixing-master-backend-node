import { Request, Response } from 'express';
import { Tag, Service } from '../models';
import { Op } from 'sequelize';

export class ServiceTagController {
  /**
   * Display a listing of the resource.
   */
  static async index(_req: Request, res: Response) {
    try {
      // Get all active tags from the tags table
      const allTags = await Tag.findAll({
        where: { is_active: 1 },
        order: [['id', 'ASC']]
      });

      // Get total services count
      const totalServices = await Service.count({
        where: { 
          is_active: 1,
          is_variation: 0 // Only count parent services, not variations
        }
      });

      // Build the response array starting with "All"
      const tags = [
        {
          tag: "All",
          slug: "all",
          count: totalServices
        }
      ];

      // Add each tag from the database with its count
      for (const tag of allTags) {
        const serviceCount = await Service.count({
          where: { 
            is_active: 1,
            is_variation: 0,
            tags: { [Op.like]: `%${tag.tag_name}%` }
          }
        });

        // Convert tag name to slug (replace spaces with hyphens)
        const slug = tag.tag_name.toLowerCase().replace(/\s+/g, '-');

        tags.push({
          tag: tag.tag_name,
          slug: slug,
          count: serviceCount
        });
      }

      return res.json(tags);
    } catch (error) {
      console.error('ServiceTag index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const tag = await Tag.findOne({
        where: { id, is_active: 1 },
      });

      if (!tag) {
        return res.status(404).json({ message: 'Tag not found' });
      }

      // Get services count for this tag
      const serviceCount = await Service.count({
        where: { 
          is_active: 1,
          is_variation: 0,
          tags: { [Op.like]: `%${tag.tag_name}%` }
        }
      });

      // Convert tag name to slug
      const slug = tag.tag_name.toLowerCase().replace(/\s+/g, '-');

      return res.json({
        ...tag.toJSON(),
        slug: slug,
        count: serviceCount
      });
    } catch (error) {
      console.error('ServiceTag show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 