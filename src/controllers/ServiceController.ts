import { Request, Response } from 'express';
import { Service, Category, Label, Tag } from '../models';
import { Op } from 'sequelize';

export class ServiceController {
  // Get all services
  static async index(req: Request, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const offset = (page - 1) * perPage;

      const where: any = { is_active: 1 };

      const { count, rows: services } = await Service.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
          },
          {
            model: Label,
            as: 'label',
            attributes: ['id', 'name'],
          },
        ],
        offset,
        limit: perPage,
        order: [['created_at', 'DESC']],
      });

      const lastPage = Math.ceil(count / perPage);

      // Add label_name and category_name to each service and remove nested objects
      const servicesWithNames = services.map((service: any) => {
        const serviceData = service.toJSON();
        const { label, category } = serviceData;
        
        // Convert numeric values to strings
        return {
          id: serviceData.id.toString(),
          parent_id: serviceData.parent_id.toString(),
          category_id: serviceData.category_id.toString(),
          image: serviceData.image,
          is_url: serviceData.is_url.toString(),
          name: serviceData.name,
          service_type: serviceData.service_type,
          price: serviceData.price ? serviceData.price.toString() : "0",
          discounted_price: serviceData.discounted_price ? serviceData.discounted_price.toString() : "0",
          label_id: serviceData.label_id.toString(),
          tags: serviceData.tags || "",
          paypal_product_id: serviceData.paypal_product_id,
          paypal_plan_id: serviceData.paypal_plan_id,
          stripe_plan_id: serviceData.stripe_plan_id,
          stripe_product_id: serviceData.stripe_product_id,
          label_name: label ? label.name : null,
          category_name: category ? category.name : null,
          is_variation: serviceData.is_variation.toString(),
        };
      });

      // Generate pagination URLs
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const firstPageUrl = `${baseUrl}?page=1`;
      const lastPageUrl = `${baseUrl}?page=${lastPage}`;
      const nextPageUrl = page < lastPage ? `${baseUrl}?page=${page + 1}` : null;
      const prevPageUrl = page > 1 ? `${baseUrl}?page=${page - 1}` : null;

      // Generate pagination links
      const links = [];
      
      // Previous link
      links.push({
        url: prevPageUrl,
        label: "&laquo; Previous",
        active: false
      });

      // Page number links
      for (let i = 1; i <= lastPage; i++) {
        links.push({
          url: i === 1 ? baseUrl : `${baseUrl}?page=${i}`,
          label: i.toString(),
          active: i === page
        });
      }

      // Next link
      links.push({
        url: nextPageUrl,
        label: "Next &raquo;",
        active: false
      });

      return res.json({
        current_page: page,
        data: servicesWithNames,
        first_page_url: firstPageUrl,
        from: ((page - 1) * perPage) + 1,
        last_page: lastPage,
        last_page_url: lastPageUrl,
        links: links,
        next_page_url: nextPageUrl,
        path: baseUrl,
        per_page: perPage,
        prev_page_url: prevPageUrl,
        to: Math.min(page * perPage, count),
        total: count,
      });
    } catch (error) {
      console.error('Service index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get service details by ID with variations
  static async getServiceDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;     
      // Find the main service
      const service = await Service.findOne({
        where: { id, is_active: 1 },
        include: [
          {
            model: Category,
            as: 'category',
          },
          {
            model: Label,
            as: 'label',
          },
        ],
      });

      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // Find variations (child services) if this is a parent service
      let variations: any[] = [];
      if (service.parent_id === 0) {
        variations = await Service.findAll({
          where: { 
            parent_id: service.id, 
            is_active: 1 
          },
          order: [['createdAt', 'ASC']],
        });
      }

      // Convert service to JSON and format the response
      const serviceData = service.toJSON() as any;
      
      // Convert numeric values to appropriate types
      const formattedService = {
        id: serviceData.id,
        category_id: serviceData.category_id,
        label_id: serviceData.label_id,
        parent_id: serviceData.parent_id,
        paypal_product_id: serviceData.paypal_product_id,
        paypal_plan_id: serviceData.paypal_plan_id,
        stripe_product_id: serviceData.stripe_product_id,
        stripe_plan_id: serviceData.stripe_plan_id,
        name: serviceData.name,
        image: serviceData.image,
        is_url: serviceData.is_url,
        price: serviceData.price,
        discounted_price: serviceData.discounted_price,
        service_type: serviceData.service_type,
        detail: serviceData.detail,
        brief_detail: serviceData.brief_detail,
        includes: serviceData.includes,
        description: serviceData.description,
        requirements: serviceData.requirements,
        notes: serviceData.notes,
        tags: serviceData.tags,
        is_active: serviceData.is_active,
        is_variation: serviceData.is_variation,
        detail_data: serviceData.detail_data,
        is_session: serviceData.is_session,
        created_at: serviceData.createdAt,
        updated_at: serviceData.updatedAt,
        variation: variations,
        category: serviceData.category,
        label: serviceData.label,
      };

      return res.json(formattedService);
    } catch (error) {
      console.error('Service details error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get service by ID
  static async show(req: Request, res: Response) {
    try {
      const tagSlug = req.params['tag'];
      const page = parseInt(req.query['page'] as string) || 1;
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const offset = (page - 1) * perPage;

      // Convert slug to tag name (replace "-" with " ")
      const tagName = tagSlug?.replace(/-/g, ' ') || '';
      
      // Find the tag by tag_name
      const tag = await Tag.findOne({
        where: { 
          tag_name: tagName,
          is_active: 1 
        }
      });

      if (!tag) {
        return res.status(404).json({ 
          message: `Tag not found: ${tagName}`,
          tag: tagName
        });
      }

      // Build where conditions for services
      let where: any = { 
        is_active: 1,
        is_variation: 0 // Only parent services
      };

      // Filter services by tag_name in the tags field
      where.tags = { [Op.like]: `%${tag.tag_name}%` };

      const { count, rows: services } = await Service.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
          },
          {
            model: Label,
            as: 'label',
            attributes: ['id', 'name'],
          },
        ],
        offset,
        limit: perPage,
        order: [['created_at', 'DESC']],
      });

      if (!services || services.length === 0) {
        return res.status(404).json({ 
          message: `No services found for tag: ${tag.tag_name}`,
          tag: tag.tag_name,
          tag_slug: tagSlug
        });
      }

      const lastPage = Math.ceil(count / perPage);

      // Add label_name and category_name to each service and remove nested objects
      const servicesWithNames = services.map((service: any) => {
        const serviceData = service.toJSON();
        const { label, category } = serviceData;
        
        // Convert numeric values to strings
        return {
          id: serviceData.id.toString(),
          parent_id: serviceData.parent_id.toString(),
          category_id: serviceData.category_id.toString(),
          image: serviceData.image,
          is_url: serviceData.is_url.toString(),
          name: serviceData.name,
          service_type: serviceData.service_type,
          price: serviceData.price ? serviceData.price.toString() : "0",
          discounted_price: serviceData.discounted_price ? serviceData.discounted_price.toString() : "0",
          label_id: serviceData.label_id.toString(),
          tags: serviceData.tags || "",
          paypal_product_id: serviceData.paypal_product_id,
          paypal_plan_id: serviceData.paypal_plan_id,
          stripe_plan_id: serviceData.stripe_plan_id,
          stripe_product_id: serviceData.stripe_product_id,
          label_name: label ? label.name : null,
          category_name: category ? category.name : null,
          is_variation: serviceData.is_variation.toString(),
        };
      });

      // Generate pagination URLs
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const firstPageUrl = `${baseUrl}?page=1`;
      const lastPageUrl = `${baseUrl}?page=${lastPage}`;
      const nextPageUrl = page < lastPage ? `${baseUrl}?page=${page + 1}` : null;
      const prevPageUrl = page > 1 ? `${baseUrl}?page=${page - 1}` : null;

      // Generate pagination links
      const links = [];
      
      // Previous link
      links.push({
        url: prevPageUrl,
        label: "&laquo; Previous",
        active: false
      });

      // Page number links
      for (let i = 1; i <= lastPage; i++) {
        links.push({
          url: i === 1 ? baseUrl : `${baseUrl}?page=${i}`,
          label: i.toString(),
          active: i === page
        });
      }

      // Next link
      links.push({
        url: nextPageUrl,
        label: "Next &raquo;",
        active: false
      });

      return res.json({
        current_page: page,
        data: servicesWithNames,
        first_page_url: firstPageUrl,
        from: ((page - 1) * perPage) + 1,
        last_page: lastPage,
        last_page_url: lastPageUrl,
        links: links,
        next_page_url: nextPageUrl,
        path: baseUrl,
        per_page: perPage,
        prev_page_url: prevPageUrl,
        to: Math.min(page * perPage, count),
        total: count,
      });
    } catch (error) {
      console.error('Service show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get service variations (other services in the same category, excluding the current one)
  static async getVariations(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Find the service to get its categoryId
      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      const variations = await Service.findAll({
        where: {
          category_id: service.category_id,
          id: { [Op.ne]: id },
          is_active: 1,
        },
        include: [
          {
            model: Category,
            as: 'category',
          },
        ],
        limit: 5,
        order: [['createdAt', 'DESC']],
      });
      return res.json({
        success: true,
        data: { variations },
      });
    } catch (error) {
      console.error('Service variations error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Search services
  static async search(req: Request, res: Response) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      const where = {
        status: 'ACTIVE',
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      };
      const services = await Service.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
          },
        ],
        offset,
        limit: parseInt(limit as string),
        order: [['createdAt', 'DESC']],
      });
      return res.json({
        success: true,
        data: {
          services: services.rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: services.count,
            pages: Math.ceil(services.count / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      console.error('Service search error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get services by category
  static async getByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query['page'] as string) || 1;
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const offset = (page - 1) * perPage;
      
      const where = {
        category_id: categoryId,
        is_active: 1,
        parent_id: 0,
      };
      
      const { count, rows: services } = await Service.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: 'category',
          },
          {
            model: Label,
            as: 'label',
            attributes: ['id', 'name'],
          },
        ],
        offset,
        limit: perPage,
        order: [['createdAt', 'DESC']],
      });
      
      const lastPage = Math.ceil(count / perPage);
      
      // Add label_name and category_name to each service and remove nested objects
      const servicesWithNames = services.map((service: any) => {
        const serviceData = service.toJSON();
        const { label, category } = serviceData;
        
        // Convert numeric values to strings
        return {
          id: serviceData.id.toString(),
          parent_id: serviceData.parent_id.toString(),
          category_id: serviceData.category_id.toString(),
          image: serviceData.image,
          is_url: serviceData.is_url.toString(),
          name: serviceData.name,
          service_type: serviceData.service_type,
          price: serviceData.price ? serviceData.price.toString() : "0",
          discounted_price: serviceData.discounted_price ? serviceData.discounted_price.toString() : "0",
          label_id: serviceData.label_id.toString(),
          tags: serviceData.tags || "",
          paypal_product_id: serviceData.paypal_product_id,
          paypal_plan_id: serviceData.paypal_plan_id,
          stripe_plan_id: serviceData.stripe_plan_id,
          stripe_product_id: serviceData.stripe_product_id,
          label_name: label ? label.name : null,
          category_name: category ? category.name : null,
          is_variation: serviceData.is_variation.toString(),
        };
      });

      // Generate pagination URLs
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const firstPageUrl = `${baseUrl}?page=1`;
      const lastPageUrl = `${baseUrl}?page=${lastPage}`;
      const nextPageUrl = page < lastPage ? `${baseUrl}?page=${page + 1}` : null;
      const prevPageUrl = page > 1 ? `${baseUrl}?page=${page - 1}` : null;

      // Generate pagination links
      const links = [];
      
      // Previous link
      links.push({
        url: prevPageUrl,
        label: "&laquo; Previous",
        active: false
      });

      // Page number links
      for (let i = 1; i <= lastPage; i++) {
        links.push({
          url: i === 1 ? baseUrl : `${baseUrl}?page=${i}`,
          label: i.toString(),
          active: i === page
        });
      }

      // Next link
      links.push({
        url: nextPageUrl,
        label: "Next &raquo;",
        active: false
      });

      return res.json({
        current_page: page,
        data: servicesWithNames,
        first_page_url: firstPageUrl,
        from: ((page - 1) * perPage) + 1,
        last_page: lastPage,
        last_page_url: lastPageUrl,
        links: links,
        next_page_url: nextPageUrl,
        path: baseUrl,
        per_page: perPage,
        prev_page_url: prevPageUrl,
        to: Math.min(page * perPage, count),
        total: count,
      });
    } catch (error) {
      console.error('Service by category error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 