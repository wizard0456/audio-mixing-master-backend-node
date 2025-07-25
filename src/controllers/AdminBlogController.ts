import { Request, Response } from 'express';
import { Blog, BlogCategory } from '../models';
import { Op } from 'sequelize';

export class AdminBlogController {
  // Get all blogs (admin view)
  static async index(req: Request, res: Response) {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const perPage = parseInt(req.query['per_page'] as string) || 10;
      const search = req.query['search'] as string;
      const categoryId = req.query['category_id'] as string;
      const isPublished = req.query['is_published'] as string;
      const offset = (page - 1) * perPage;

      // Build where conditions
      const whereConditions: any = {};

      // Add search functionality
      if (search && search.trim()) {
        whereConditions[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { author_name: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }

      // Add category filter
      if (categoryId) {
        whereConditions.category_id = parseInt(categoryId);
      }

      // Add published filter
      if (isPublished !== undefined) {
        whereConditions.is_published = isPublished === 'true' ? 1 : 0;
      }

      const { count, rows: blogs } = await Blog.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: BlogCategory,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: perPage,
        offset: offset,
      });

      const totalPages = Math.ceil(count / perPage);

      return res.json({
        success: true,
        data: {
          blogs,
          pagination: {
            current_page: page,
            per_page: perPage,
            total: count,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_prev_page: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Admin blog index error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get blog by ID (admin view)
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const blog = await Blog.findOne({
        where: { id: parseInt(id || '0') },
        include: [
          {
            model: BlogCategory,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
      });

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      return res.json({ success: true, data: { blog } });
    } catch (error) {
      console.error('Admin blog show error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Create blog (admin)
  static async create(req: Request, res: Response) {
    try {
      const {
        title,
        author_name,
        publish_date,
        read_time,
        content,
        keywords,
        html_content,
        category_id,
        is_active
      } = req.body;

      // Generate slug from title
      const slug = (title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const existingBlog = await Blog.findOne({ where: { slug } });
      if (existingBlog) {
        return res.status(400).json({ message: 'A blog with this title already exists' });
      }

      const blog = await Blog.create({
        title: title || '',
        slug,
        author_name: author_name || '',
        publish_date: new Date(publish_date),
        read_time: parseInt(read_time || '5'),
        content: content || '',
        html_content: html_content || content || '',
        keywords: keywords || '',
        meta_description: '', // Not provided in frontend
        category_id: parseInt(category_id || '1'),
        is_published: (is_active === '1' || is_active === 1 || is_active === true) ? 1 : 0,
      });

      return res.status(201).json({ success: true, data: { blog } });
    } catch (error) {
      console.error('Admin blog create error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Update blog (admin)
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        author_name,
        publish_date,
        read_time,
        content,
        keywords,
        meta_description,
        html_content,
        category_id,
        is_published
      } = req.body;

      const blog = await Blog.findByPk(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Generate new slug if title changed
      let slug = blog.slug;
      if (title && title !== blog.title) {
        slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if new slug already exists
        const existingBlog = await Blog.findOne({ where: { slug, id: { [Op.ne]: id } } });
        if (existingBlog) {
          return res.status(400).json({ message: 'A blog with this title already exists' });
        }
      }

      await blog.update({
        title: title || blog.title,
        slug,
        author_name: author_name || blog.author_name,
        publish_date: publish_date ? new Date(publish_date) : blog.publish_date,
        read_time: read_time ? parseInt(read_time) : blog.read_time,
        content: content || blog.content,
        html_content: html_content || content || blog.html_content,
        keywords: keywords !== undefined ? keywords : blog.keywords,
        meta_description: meta_description !== undefined ? meta_description : blog.meta_description,
        category_id: category_id ? parseInt(category_id) : blog.category_id,
        is_published: is_published !== undefined ? parseInt(is_published) : blog.is_published
      });

      return res.json({ success: true, data: { blog } });
    } catch (error) {
      console.error('Admin blog update error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Update blog status (admin)
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      // Validation
      if (status === undefined || status === null) {
        return res.status(400).json({ error: 'Status is required.' });
      }

      const blog = await Blog.findByPk(id);
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      // Update blog status
      const statusValue = Array.isArray(status) ? status[0] : status;
      blog.is_published = (String(statusValue) === '1' || String(statusValue) === 'true') ? 1 : 0;
      await blog.save();

      return res.json({ 
        success: true, 
        message: 'Blog status updated successfully',
        data: { blog }
      });
    } catch (error) {
      console.error('Admin update blog status error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete blog (admin)
  static async destroy(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const blog = await Blog.findByPk(id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      await blog.destroy();
      return res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Admin blog delete error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get blog categories (admin)
  static async getCategories(_req: Request, res: Response) {
    try {
      const categories = await BlogCategory.findAll({
        order: [['name', 'ASC']]
      });

      return res.json({ success: true, data: { categories } });
    } catch (error) {
      console.error('Admin blog categories error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Create blog category (admin)
  static async createCategory(req: Request, res: Response) {
    try {
      const { name, description } = req.body;

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const existingCategory = await BlogCategory.findOne({ where: { slug } });
      if (existingCategory) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }

      const category = await BlogCategory.create({
        name,
        slug,
        description: description || '',
        is_active: 1
      });

      return res.status(201).json({ success: true, data: { category } });
    } catch (error) {
      console.error('Admin create category error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Update blog category (admin)
  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const category = await BlogCategory.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Generate new slug if name changed
      let slug = category.slug;
      if (name && name !== category.name) {
        slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if new slug already exists
        const existingCategory = await BlogCategory.findOne({ where: { slug, id: { [Op.ne]: id } } });
        if (existingCategory) {
          return res.status(400).json({ message: 'A category with this name already exists' });
        }
      }

      await category.update({
        name: name || category.name,
        slug,
        description: description !== undefined ? description : category.description,
        is_active: is_active !== undefined ? is_active : category.is_active
      });

      return res.json({ success: true, data: { category } });
    } catch (error) {
      console.error('Admin update category error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Delete blog category (admin)
  static async destroyCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await BlogCategory.findByPk(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if category has blogs
      const blogCount = await Blog.count({ where: { category_id: id } });
      if (blogCount > 0) {
        return res.status(400).json({ message: 'Cannot delete category with existing blogs' });
      }

      await category.destroy();
      return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Admin delete category error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
} 