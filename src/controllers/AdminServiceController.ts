import { Request, Response } from 'express';
import { Service, Category, Label } from '../models';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';

export class AdminServiceController {
  /**
   * Display a listing of the resource.
   */
  static async index(req: Request, res: Response) {
    try {
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const page = parseInt(req.query['page'] as string) || 1;
      const isActive = req.query['is_active'] as string;
      const type = req.query['type'] as string;
      const offset = (page - 1) * perPage;

      // Initialize the query with associations
      let whereClause: any = { parent_id: 0 };
      
      // Check if 'is_active' parameter is present and modify the query accordingly
      if (isActive === 'active') {
        whereClause.is_active = 1; // Filter for active services
      } else if (isActive === 'inactive') {
        whereClause.is_active = 0; // Filter for inactive services
      }

      // Add type filtering
      if (type === 'one_time') {
        whereClause.price = { [Op.ne]: null };
      } else if (type === 'monthly') {
        whereClause.monthly_price = { [Op.ne]: null };
      }

      const { count, rows } = await Service.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'category',
            where: { is_active: 1 },
            required: false,
          },
          {
            model: Label,
            as: 'label',
            where: { is_active: 1 },
            required: false,
          },
        ],
        order: [['id', 'DESC']],
        limit: perPage,
        offset: offset,
      });

      const totalPages = Math.ceil(count / perPage);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const data = {
        data: rows,
        current_page: page,
        per_page: perPage,
        total: count,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      };

      return res.json(data);
    } catch (error) {
      console.error('Error in AdminServiceController.index:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Display the specified resource.
   */
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const service = await Service.findOne({
        where: { id },
        include: [
          {
            model: Category,
            as: 'category',
            where: { is_active: 1 },
            required: false,
          },
          {
            model: Label,
            as: 'label',
            where: { is_active: 1 },
            required: false,
          },
        ],
      });

      if (!service) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Get sub-services (variations) if this is a parent service
      const subServices = await Service.findAll({
        where: { parent_id: id, is_active: 1 },
      });

      if (subServices.length > 0) {
        (service as any).variation = subServices;
      }

      return res.json(service);
    } catch (error) {
      console.error('Error in AdminServiceController.show:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Store a newly created resource in storage.
   */
  static async store(req: Request, res: Response) {
    const transaction = await sequelize.transaction();

    try {
      // Validation
      const {
        category_id,
        label_id,
        name,
        one_time_price,
        one_time_discounted_price,
        monthly_price,
        monthly_discounted_price,
        detail,
        brief_detail,
        includes,
        description,
        requirements,
        notes,
        tags,
        service_option,
        is_variation,
        product_variation,
        is_url,
        is_active,
        image
      } = req.body;

      // Basic validation
      if (!category_id) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Category required.' });
      }

      if (!label_id) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Label required.' });
      }

      if (!name || name.trim().length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Name required.' });
      }

      if (name.length > 255) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Name maximum 255 characters.' });
      }

      if (!detail || detail.trim().length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Detail required.' });
      }

      if (!service_option) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Service option required.' });
      }

      if (is_variation === 1 && !product_variation) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Variations of product required' });
      }

      // Handle image upload or URL
      let imageName = '';
      if (is_url === 0 && req.file) {
        const imageFile = req.file;
        imageName = `service_image_${Date.now()}.${imageFile.originalname.split('.').pop()}`;
        
        // Create directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'service-images');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, imageName);
        fs.writeFileSync(filePath, imageFile.buffer);
        imageName = `service-images/${imageName}`;
      } else if (is_url === 1 && image) {
        imageName = image;
      }

      let parentId = 0;

             if (service_option === 'oneTime') {
         const service = await Service.create({
           category_id,
           label_id,
           parent_id: 0,
           name: name.trim(),
           image: imageName,
           service_type: 'one_time',
           price: one_time_price,
           discounted_price: one_time_discounted_price || 0,
           detail: detail.trim(),
           brief_detail: brief_detail || null,
           includes: includes || null,
           description: description || null,
           requirements: requirements || null,
           notes: notes || null,
           tags: tags || null,
           is_url: is_url || 0,
           is_active: is_active !== undefined ? is_active : 1,
           is_variation: is_variation || 0,
         }, { transaction });

        parentId = service.id;

        // Handle variations if needed
        if (is_variation === 1 && product_variation) {
          try {
            const variations = JSON.parse(product_variation);
            if (Array.isArray(variations) && variations.length > 0) {
              for (const variation of variations) {
                await Service.create({
                  category_id,
                  parent_id: parentId,
                  label_id,
                  name: variation.name,
                  image: imageName,
                  service_type: 'one_time',
                  price: variation.price,
                  discounted_price: variation.discounted_price || 0,
                  detail: detail.trim(),
                  brief_detail: brief_detail || null,
                  includes: includes || null,
                  description: description || null,
                  requirements: requirements || null,
                  notes: notes || null,
                  tags: tags || null,
                  is_url: is_url || 0,
                  is_active: is_active !== undefined ? is_active : 1,
                  is_variation: 0,
                }, { transaction });
              }
            }
          } catch (error) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid product variation format.' });
          }
        }
             } else if (service_option === 'monthly') {
         await Service.create({
           category_id,
           label_id,
           parent_id: 0,
           name: name.trim(),
           image: imageName,
           service_type: 'subscription',
           price: monthly_price,
           discounted_price: monthly_discounted_price || 0,
           detail: detail.trim(),
           brief_detail: brief_detail || null,
           includes: includes || null,
           description: description || null,
           requirements: requirements || null,
           notes: notes || null,
           tags: tags || null,
           is_url: is_url || 0,
           is_active: is_active !== undefined ? is_active : 1,
         }, { transaction });

        // Note: PayPal and Stripe integration would go here
        // For now, we'll create the service without payment provider integration
      } else if (service_option === 'both') {
                 // Create one-time service
         const oneTimeService = await Service.create({
           category_id,
           label_id,
           parent_id: 0,
           name: name.trim(),
           image: imageName,
           service_type: 'one_time',
           price: one_time_price,
           discounted_price: one_time_discounted_price || 0,
           detail: detail.trim(),
           brief_detail: brief_detail || null,
           includes: includes || null,
           description: description || null,
           requirements: requirements || null,
           notes: notes || null,
           tags: tags || null,
           is_url: is_url || 0,
           is_active: is_active !== undefined ? is_active : 1,
         }, { transaction });

         parentId = oneTimeService.id;

         // Create subscription service
         await Service.create({
           category_id,
           label_id,
           parent_id: 0,
           name: name.trim(),
           image: imageName,
           service_type: 'subscription',
           price: monthly_price,
           discounted_price: monthly_discounted_price || 0,
           detail: detail.trim(),
           brief_detail: brief_detail || null,
           includes: includes || null,
           description: description || null,
           requirements: requirements || null,
           notes: notes || null,
           tags: tags || null,
           is_url: is_url || 0,
           is_active: is_active !== undefined ? is_active : 1,
         }, { transaction });

        // Note: PayPal and Stripe integration would go here
      }

      await transaction.commit();
      return res.json({ status: 'success' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error in AdminServiceController.store:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource in storage.
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        category_id,
        label_id,
        name,
        one_time_price,
        one_time_discounted_price,
        monthly_price,
        monthly_discounted_price,
        detail,
        brief_detail,
        includes,
        description,
        requirements,
        notes,
        tags,
        service_option,
        image,
        is_url,
        is_active,
        is_variation,
        product_variation,
      } = req.body;

      // Validation
      if (!category_id) {
        return res.status(400).json({ error: 'Category required.' });
      }

      if (!label_id) {
        return res.status(400).json({ error: 'Label required.' });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name required.' });
      }

      if (name.length > 255) {
        return res.status(400).json({ error: 'Name maximum 255 characters.' });
      }

      if (!detail || detail.trim().length === 0) {
        return res.status(400).json({ error: 'Detail required.' });
      }

      if (!service_option) {
        return res.status(400).json({ error: 'Service option required.' });
      }

      const service = await Service.findByPk(id);

      if (!service) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Handle image upload or URL
      if (is_url === 0 && req.file) {
        const imageFile = req.file;
        const imageName = `service_image_${Date.now()}.${imageFile.originalname.split('.').pop()}`;
        
        // Create directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'service-images');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, imageName);
        fs.writeFileSync(filePath, imageFile.buffer);
        service.image = `service-images/${imageName}`;
      } else if (is_url === 1 && image) {
        service.image = image;
      }

      // Update service based on service option
      if (service_option === 'oneTime') {
        service.service_type = 'one_time';
        service.price = one_time_price;
        service.discounted_price = one_time_discounted_price || null;
      } else if (service_option === 'monthly') {
        service.service_type = 'subscription';
        service.price = monthly_price;
        service.discounted_price = monthly_discounted_price || null;
        // Note: PayPal and Stripe integration would go here
      }

      // General updates
      service.category_id = category_id;
      service.label_id = label_id;
      service.name = name.trim();
      service.detail = detail.trim();
      service.brief_detail = brief_detail || null;
      service.includes = includes || null;
      service.description = description || null;
      service.requirements = requirements || null;
      service.notes = notes || null;
      service.tags = tags || null;
      service.is_variation = is_variation || 0;
      service.is_url = is_url || 0;
      service.is_active = is_active !== undefined ? is_active : 1;

      await service.save();

      // Handle variations
      if (is_variation === 1 && product_variation) {
        try {
          const variations = JSON.parse(product_variation);
          if (Array.isArray(variations) && variations.length > 0) {
            // Get existing variation IDs from request
            const variationIdsFromRequest = variations
              .map((v: any) => v.id)
              .filter((id: any) => id != null);

            // Deactivate variations not included in the request
            await Service.update(
              { is_active: 0 },
              { 
                where: { 
                  parent_id: parseInt(id || '0'),
                  id: { [Op.notIn]: variationIdsFromRequest }
                }
              }
            );

            // Update or create variations
            for (const variation of variations) {
              if (variation.id) {
                // Update existing variation
                const existingVariation = await Service.findByPk(variation.id);
                if (existingVariation) {
                  existingVariation.name = variation.name;
                  existingVariation.price = variation.price;
                  existingVariation.discounted_price = variation.discounted_price || 0;
                  existingVariation.is_active = 1;
                  await existingVariation.save();
                }
              } else {
                // Create new variation
                await Service.create({
                  category_id,
                  parent_id: parseInt(id || '0'),
                  label_id,
                  name: variation.name,
                  image: service.image,
                  service_type: 'one_time',
                  price: variation.price,
                  discounted_price: variation.discounted_price || 0,
                  detail: detail.trim(),
                  brief_detail: brief_detail || null,
                  includes: includes || null,
                  description: description || null,
                  requirements: requirements || null,
                  notes: notes || null,
                  tags: tags || null,
                  is_url: is_url || 0,
                  is_active: 1,
                  is_variation: 0,
                });
              }
            }
          }
        } catch (error) {
          return res.status(400).json({ error: 'Invalid product variation format.' });
        }
      } else {
        // Deactivate all existing variations
        await Service.update(
          { is_active: 0 },
          { where: { parent_id: parseInt(id || '0') } }
        );
        service.is_variation = 0;
        await service.save();
      }

      return res.json({ status: 'success' });
    } catch (error) {
      console.error('Error in AdminServiceController.update:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update the specified resource status in storage.
   */
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statusParam = req.query['status'];

      // Validation
      if (statusParam === undefined || statusParam === null) {
        return res.status(400).json({ error: 'Status required.' });
      }

      const status = statusParam === '1' ? true : false;

      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: 'Status must be a boolean value.' });
      }

      const service = await Service.findByPk(id);

      if (!service) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Update status
      service.is_active = status ? 1 : 0;
      await service.save();

      return res.json(service);
    } catch (error) {
      console.error('Error in AdminServiceController.updateStatus:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Remove the specified resource from storage.
   */
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const service = await Service.findByPk(id);

      if (!service) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Handle parent-child relationship
      if (service.parent_id && service.parent_id !== 0) {
        const parentService = await Service.findByPk(service.parent_id);
        if (parentService) {
          await parentService.destroy();
        }
      }

      await service.destroy();

      return res.json('Deleted');
    } catch (error) {
      console.error('Error in AdminServiceController.destroy:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get service list.
   */
  static async serviceList(_req: Request, res: Response) {
    try {
      const services = await Service.findAll();

      if (services.length === 0) {
        return res.status(200).json([]);
      }

      return res.json(services);
    } catch (error) {
      console.error('Error in AdminServiceController.serviceList:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 